use std::{collections::HashMap, env};

use reqwest::Client;

const PRODUCER_PORT: i32 = 9251;
const TOPIC: &str = "my-topic";
const SERVICE_NAME_VAR: &str = "POLAR_EXAMPLE_SERVICE_NAME";

#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // In Kubernetes, the PolarStreams service is a headless service that resolves to the PolarStreams broker addresses.
    let service_name: String = env::var(SERVICE_NAME_VAR).unwrap_or("polar.streams".into());

    let client = Client::new();
    let res = client
        .post(format!(
            "http://{service_name}:{PRODUCER_PORT}/v1/topic/{TOPIC}/messages"
        ))
        .json(&HashMap::from([("hello", "world")]))
        .send()
        .await?;

    println!("Message produced: {}", res.status());

    Ok(())
}
