use hyper::header::{
    ACCEPT_ENCODING, ACCEPT_LANGUAGE, CACHE_CONTROL, CDN_CACHE_CONTROL, CONTENT_ENCODING,
    CONTENT_TYPE, COOKIE, EXPIRES, LOCATION, VARY,
};
use hyper::{Body, Request, Response, StatusCode};
use lazy_static::lazy_static;
use serde::Deserialize;
use std::collections::HashMap;
use std::convert::Infallible;
use std::fs;
use std::fs::File;

#[derive(Debug, Deserialize)]
struct CrateRecipe {
    dizin: String,
    sayfalar: Vec<Sayfa>,
}

#[derive(Debug, Deserialize)]
struct Sayfa {
    tr: String,
    en: String,
}

fn load(path: &str) -> HashMap<String, &'static [u8]> {
    let mut files = HashMap::new();
    for entry in fs::read_dir(path).unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_file() {
            let filename = path.file_name().unwrap().to_string_lossy().to_string();
            let content: &'static [u8] = Box::leak(fs::read(&path).unwrap().into_boxed_slice());
            files.insert(filename, content);
        }
    }
    let file = File::open("./crate/crate.yaml").unwrap();
    let recipe: CrateRecipe = serde_yaml::from_reader(file).unwrap();

    let mut insert_alias = |alias: &str, key_base: &str, lang: &str, ext: &str| {
        if let Some(&content) = files.get(&format!("{}-{}.html{}", key_base, lang, ext)) {
            files.insert(format!("{}{}", alias, ext), content);
        }
    };

    insert_alias("?en", &recipe.dizin, "en", "");
    insert_alias("?en", &recipe.dizin, "en", ".br");
    insert_alias("?en", &recipe.dizin, "en", ".gz");
    insert_alias("?tr", &recipe.dizin, "tr", "");
    insert_alias("?tr", &recipe.dizin, "tr", ".br");
    insert_alias("?tr", &recipe.dizin, "tr", ".gz");

    for sayfa in &recipe.sayfalar {
        insert_alias(&sayfa.en, &sayfa.tr, "en", "");
        insert_alias(&sayfa.tr, &sayfa.tr, "tr", "");
        insert_alias(&sayfa.en, &sayfa.tr, "en", ".br");
        insert_alias(&sayfa.tr, &sayfa.tr, "tr", ".br");
        insert_alias(&sayfa.en, &sayfa.tr, "en", ".gz");
        insert_alias(&sayfa.tr, &sayfa.tr, "tr", ".gz");
    }

    files
}

lazy_static! {
    static ref FILES: HashMap<String, &'static [u8]> = load("./crate");
}

static STATIC_CACHE_CONTROL: &'static str = "max-age=29030400,public,immutable";

fn get_crate_key(req: &Request<Body>) -> String {
    let trimmed_path = req.uri().path().trim_matches('/');

    if !trimmed_path.is_empty() {
        return trimmed_path.to_string();
    }

    let trimmed_path = req
        .uri()
        .path_and_query()
        .unwrap()
        .as_str()
        .trim_matches('/');
    if trimmed_path.len() == 3 {
        return trimmed_path.to_string();
    }

    let cookies_str = req
        .headers()
        .get(COOKIE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    if cookies_str.contains("l=tr") {
        "?tr".to_string()
    } else if cookies_str.contains("l=en") {
        "?en".to_string()
    } else if req
        .headers()
        .get(ACCEPT_LANGUAGE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .contains("tr")
    {
        "?tr".to_string()
    } else {
        "?en".to_string()
    }
}

pub async fn serve_file(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let mut key = get_crate_key(&req);
    let accept_encoding = req
        .headers()
        .get(ACCEPT_ENCODING)
        .and_then(|val| val.to_str().ok())
        .unwrap_or("");
    let maybe_extension = key.rsplit_once('.').map(|(_, ext)| ext);
    let mime_type = crate::mimes::from_extension(maybe_extension);
    let cache_control = match maybe_extension {
        None => "max-age=90,public",
        _ => STATIC_CACHE_CONTROL,
    };
    let maybe_compression = if crate::mimes::is_compressed(maybe_extension) {
        None
    } else if accept_encoding.contains("br") {
        Some(".br")
    } else if accept_encoding.contains("gzip") {
        Some(".gzip")
    } else {
        None
    };
    if let Some(compression) = maybe_compression {
        key += &compression[..3];
    }
    match FILES.get(&key) {
        Some(&content) => {
            let mut builder = Response::builder()
                .header(CONTENT_TYPE, mime_type)
                .header(CACHE_CONTROL, cache_control)
                .header(CDN_CACHE_CONTROL, STATIC_CACHE_CONTROL)
                .header(VARY, ACCEPT_ENCODING)
                .header(EXPIRES, "Sun, 01 Jan 2034 00:00:00 GMT");

            if let Some(compression) = maybe_compression {
                builder = builder.header(CONTENT_ENCODING, &compression[1..])
            }

            Ok(builder.body(Body::from(content)).unwrap())
        }
        None => Ok(Response::builder()
            .status(StatusCode::FOUND)
            .header(LOCATION, "/")
            .body(Body::empty())
            .unwrap()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use hyper::header::HeaderValue;
    use hyper::{Body, Request, Uri};

    fn mock_request(
        uri: &'static str,
        cookies: Option<&str>,
        accept_language: Option<&str>,
    ) -> Request<Body> {
        let mut request = Request::builder()
            .uri(Uri::from_static(uri))
            .body(Body::empty())
            .unwrap();

        let headers = request.headers_mut();
        if let Some(cookie) = cookies {
            headers.insert("cookie", HeaderValue::from_str(cookie).unwrap());
        }
        if let Some(lang) = accept_language {
            headers.insert("accept-language", HeaderValue::from_str(lang).unwrap());
        }

        request
    }

    #[test]
    fn test_get_crate_key_with_non_empty_path() {
        let req = mock_request("/test", None, None);
        assert_eq!(get_crate_key(&req), "test".to_string());
    }

    #[test]
    fn test_get_crate_key_with_empty_path_and_short_query() {
        let req = mock_request("/", None, None);
        assert_eq!(get_crate_key(&req), "?en".to_string());
    }

    #[test]
    fn test_get_crate_key_with_empty_path_and_ltr_cookie() {
        let req = mock_request("/", Some("l=tr"), None);
        assert_eq!(get_crate_key(&req), "?tr".to_string());
    }

    #[test]
    fn test_get_crate_key_with_empty_path_and_len_cookie() {
        let req = mock_request("/", Some("l=en"), None);
        assert_eq!(get_crate_key(&req), "?en".to_string());
    }

    #[test]
    fn test_get_crate_key_with_empty_path_and_accept_language_tr() {
        let req = mock_request("/", None, Some("tr"));
        assert_eq!(get_crate_key(&req), "?tr".to_string());
    }

    #[test]
    fn test_get_crate_key_with_empty_path_and_accept_language_en() {
        let req = mock_request("/", None, Some("en"));
        assert_eq!(get_crate_key(&req), "?en".to_string());
    }

    #[test]
    fn test_get_crate_key_with_empty_path_no_cookies_or_headers() {
        let req = mock_request("/", None, None);
        assert_eq!(get_crate_key(&req), "?en".to_string());
    }
}
