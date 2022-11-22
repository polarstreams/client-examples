use hyper::{client::Client, Body, Method, Request};
use std::env;

const PRODUCER_PORT: i32 = 9251;
const TOPIC: &str = "my-topic";
const SERVICE_NAME_VAR: &str = "BARCO_EXAMPLE_SERVICE_NAME";

#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // In Kubernetes, the Barco service is a headless service that resolves to the Barco broker addresses.
    let service_name: String = env::var(SERVICE_NAME_VAR).unwrap_or("barco.streams".into());

    let client = Client::new();
    let req = Request::builder()
        .method(Method::POST)
        .uri(format!(
            "http://{service_name}:{PRODUCER_PORT}/v1/topic/{TOPIC}/messages"
        ))
        .header("content-type", "application/json")
        .body(Body::from(r#"{"hello":"world"}"#))?;

    // Produce a message
    let resp = client.request(req).await?;
    println!("Message produced: {}", resp.status());

    Ok(())
}
