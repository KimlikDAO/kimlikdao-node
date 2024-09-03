use arrayvec::ArrayString;
use hyper::header::{
    ACCEPT_ENCODING, ACCEPT_LANGUAGE, CACHE_CONTROL, CDN_CACHE_CONTROL, CONTENT_ENCODING,
    CONTENT_TYPE, COOKIE, EXPIRES, LOCATION, VARY,
};
use hyper::{Body, Request, Response, StatusCode};
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::convert::Infallible;
use std::fs;

fn load(path: &str) -> HashMap<ArrayString<16>, &'static [u8]> {
    let mut files = HashMap::new();
    for entry in fs::read_dir(path).unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_file() {
            let filename = path.file_name().unwrap().to_string_lossy();
            if let Ok(array_key) = ArrayString::<16>::from(&filename[..]) {
                let content: &'static [u8] = Box::leak(fs::read(&path).unwrap().into_boxed_slice());
                files.insert(array_key, content);
            } else {
                eprintln!("Filename '{}' is too long for ArrayString<16>", filename);
            }
        }
    }
    files
}

lazy_static! {
    static ref FILES: HashMap<ArrayString<16>, &'static [u8]> = load("./crate");
}

static STATIC_CACHE_CONTROL: &'static str = "max-age=29030400,public,immutable";

fn get_crate_key(req: &Request<Body>) -> &str {
    let key = req.uri().path().trim_matches('/');
    if !key.is_empty() {
        return key;
    }

    if let Some(cookie_header) = req.headers().get(COOKIE)
        && let Ok(cookie_str) = cookie_header.to_str()
        && let Some(leq) = cookie_str.find("l=")
    {
        return &cookie_str[leq + 2..leq + 4];
    }

    if let Some(lang) = req.headers().get(ACCEPT_LANGUAGE)
        && let Ok(lang_str) = lang.to_str()
        && lang_str.contains("tr")
    {
        return "tr";
    }
    "en"
}

pub async fn serve_file(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let mut key = ArrayString::<16>::new();
    key.push_str(get_crate_key(&req));
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
        key.push_str(&compression[..3]);
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
    use hyper::{
        header::{ACCEPT_LANGUAGE, COOKIE},
        Body, Request,
    };

    #[test]
    fn test_get_crate_key_with_path() {
        // Case 1: Request with a non-empty path
        let req = Request::builder()
            .uri("/somepath")
            .body(Body::empty())
            .unwrap();
        assert_eq!(get_crate_key(&req), "somepath");
    }

    #[test]
    fn test_get_crate_key_with_cookie_language() {
        // Case 2: Request with a cookie containing 'l='
        let req = Request::builder()
            .header(COOKIE, "session=abc; l=tr; other=data")
            .body(Body::empty())
            .unwrap();
        assert_eq!(get_crate_key(&req), "tr");
    }

    #[test]
    fn test_get_crate_key_with_accept_language_header() {
        // Case 3: Request with 'Accept-Language' header containing 'tr'
        let req = Request::builder()
            .header(ACCEPT_LANGUAGE, "tr, en;q=0.8")
            .body(Body::empty())
            .unwrap();
        assert_eq!(get_crate_key(&req), "tr");

        // Case 4: Request with 'Accept-Language' header not containing 'tr'
        let req = Request::builder()
            .header(ACCEPT_LANGUAGE, "en, fr;q=0.8")
            .body(Body::empty())
            .unwrap();
        assert_eq!(get_crate_key(&req), "en");
    }

    #[test]
    fn test_get_crate_key_with_no_headers() {
        // Case 5: Request with no relevant headers and no path
        let req = Request::builder().uri("/").body(Body::empty()).unwrap();
        assert_eq!(get_crate_key(&req), "en");
    }

    #[test]
    fn test_get_crate_key_empty_cookie_header() {
        // Case 6: Request with empty cookie header
        let req = Request::builder()
            .header(COOKIE, "")
            .body(Body::empty())
            .unwrap();
        assert_eq!(get_crate_key(&req), "en");
    }
}
