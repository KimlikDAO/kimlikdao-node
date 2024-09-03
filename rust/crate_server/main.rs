#![feature(let_chains)]

use hyper::server::Server;
use hyper::service::{make_service_fn, service_fn};
use std::convert::Infallible;
use std::net::SocketAddr;

mod crates;
mod mimes;

#[tokio::main]
async fn main() {
    let make_svc = make_service_fn(move |_conn| async move {
        Ok::<_, Infallible>(service_fn(move |req| crates::serve_file(req)))
    });

    let addr = SocketAddr::from(([0, 0, 0, 0, 0, 0, 0, 0], 80));
    let server = Server::bind(&addr).serve(make_svc);

    println!("Listening on http://{}", addr);
    if let Err(e) = server.await {
        eprintln!("Server error: {}", e);
    }
}
