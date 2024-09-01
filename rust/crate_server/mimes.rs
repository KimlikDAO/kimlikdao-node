pub fn is_compressed(maybe_extension: Option<&str>) -> bool {
    matches!(maybe_extension, Some("woff2") | Some("png") | Some("webp"))
}

pub fn from_extension(maybe_extension: Option<&str>) -> &'static str {
    match maybe_extension {
        Some("css") => "text/css",
        Some("js") => "application/javascript;charset=utf-8",
        Some("ttf") => "font/ttf",
        Some("woff2") => "font/woff2",
        Some("svg") => "image/svg+xml",
        Some("png") => "image/png",
        Some("webp") => "image/webp",
        Some("txt") => "text/plain;charset=utf-8",
        _ => "text/html;charset=utf-8",
    }
}
