use hyper::header::{
    ACCEPT_ENCODING, ACCEPT_LANGUAGE, CACHE_CONTROL, CDN_CACHE_CONTROL, CONTENT_ENCODING,
    CONTENT_TYPE, COOKIE, EXPIRES, LOCATION, VARY,
};
use hyper::server::Server;
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Request, Response, StatusCode};
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::convert::Infallible;
use std::net::SocketAddr;

mod crates;
mod mimes;

static STATIC_CACHE_CONTROL: &'static str = "max-age=29030400,public,immutable";

lazy_static! {
    static ref FILES: HashMap<String, &'static [u8]> = crates::load("./crate");
}

fn get_path(req: &Request<Body>) -> String {
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

async fn handle_request(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let mut path = get_path(&req);
    let accept_encoding = req
        .headers()
        .get(ACCEPT_ENCODING)
        .and_then(|val| val.to_str().ok())
        .unwrap_or("");
    let maybe_extension = path.rsplit_once('.').map(|(_, ext)| ext);
    let mime_type = mimes::from_extension(maybe_extension);
    let cache_control = match maybe_extension {
        None => "max-age=90,public",
        _ => STATIC_CACHE_CONTROL,
    };
    let maybe_compression = if mimes::is_compressed(maybe_extension) {
        None
    } else if accept_encoding.contains("br") {
        Some(".br")
    } else if accept_encoding.contains("gzip") {
        Some(".gzip")
    } else {
        None
    };
    if let Some(compression) = maybe_compression {
        path += &compression[..3];
    }
    match FILES.get(&path) {
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

#[tokio::main]
async fn main() {
    let make_svc = make_service_fn(move |_conn| async move {
        Ok::<_, Infallible>(service_fn(move |req| handle_request(req)))
    });

    let addr = SocketAddr::from(([127, 0, 0, 1], 8787)); // Running server on localhost:3000
    let server = Server::bind(&addr).serve(make_svc);

    println!("Listening on http://{}", addr);
    if let Err(e) = server.await {
        eprintln!("Server error: {}", e);
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
    fn test_get_path_with_non_empty_path() {
        let req = mock_request("/test", None, None);
        assert_eq!(get_path(&req), "test".to_string());
    }

    #[test]
    fn test_get_path_with_empty_path_and_short_query() {
        let req = mock_request("/", None, None);
        assert_eq!(get_path(&req), "?en".to_string());
    }

    #[test]
    fn test_get_path_with_empty_path_and_ltr_cookie() {
        let req = mock_request("/", Some("l=tr"), None);
        assert_eq!(get_path(&req), "?tr".to_string());
    }

    #[test]
    fn test_get_path_with_empty_path_and_len_cookie() {
        let req = mock_request("/", Some("l=en"), None);
        assert_eq!(get_path(&req), "?en".to_string());
    }

    #[test]
    fn test_get_path_with_empty_path_and_accept_language_tr() {
        let req = mock_request("/", None, Some("tr"));
        assert_eq!(get_path(&req), "?tr".to_string());
    }

    #[test]
    fn test_get_path_with_empty_path_and_accept_language_en() {
        let req = mock_request("/", None, Some("en"));
        assert_eq!(get_path(&req), "?en".to_string());
    }

    #[test]
    fn test_get_path_with_empty_path_no_cookies_or_headers() {
        let req = mock_request("/", None, None);
        assert_eq!(get_path(&req), "?en".to_string());
    }
}
