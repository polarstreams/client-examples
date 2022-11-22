use std::{collections::HashMap, env, time::Duration};

use reqwest::header::ACCEPT;
use reqwest::{Client, StatusCode};
use serde::Deserialize;
use tokio::{signal::unix::{signal, SignalKind}, time::sleep};
use serde_with::{serde_as, DisplayFromStr};

const CONSUMER_PORT: i32 = 9252; // The port number of the Barco consumer interface
const DISCOVERY_PORT: i32 = 9250; // The port number of the Barco discovery interface
const TOPIC: &str = "my-topic";
const SERVICE_NAME_VAR: &str = "BARCO_EXAMPLE_SERVICE_NAME";
const CONSUMER_GROUP: &str = "my-group";
const CONSUMER_ID: &str = "c1"; // A unique id of the client in the cluster, uuids or the application instance id are good a fit

#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // In Kubernetes, the Barco service is a headless service that resolves to the Barco broker addresses.
    let service_name: String = env::var(SERVICE_NAME_VAR).unwrap_or("barco.streams".into());

    let discovery = Discovery::new(&service_name).await?;
    println!("Discovered {} broker(s)", discovery.brokers.len());
    let client = Client::new();

    // Register the consumer using an unique consumer id and the group it belongs to
    let uri = format!("http://{service_name}:{CONSUMER_PORT}/v1/consumer/register?consumerId={CONSUMER_ID}&group={CONSUMER_GROUP}&topic={TOPIC}");
    client.put(uri).send().await?;

    println!("Starting to poll for data, use Ctrl+C to exit");
    let mut interrupt_signal = signal(SignalKind::interrupt())?;

    loop {
        let mut has_data = false;
        for broker in discovery.brokers.iter() {
            let uri = format!(
                "http://{broker}:{CONSUMER_PORT}/v1/consumer/poll?consumerId={CONSUMER_ID}"
            );
            let res = client
                .post(&uri)
                .header(ACCEPT, "application/json")
                .send()
                .await?;

            match res.status() {
                StatusCode::OK => {
                    has_data = true;
                    match res.json::<Vec<ConsumerResponse>>().await {
                        Ok(items) => {
                            for response_item in items {
                                // Do something with the data...
                                for event in response_item.values {
                                    println!("Received event: {:#?}", event);
                                }
                            }
                        }
                        Err(e) => eprintln!("There was an error parsing the . {:?}", e),
                    };
                }
                StatusCode::NO_CONTENT => {}
                other => {
                    panic!("There was an unexpected error when polling: {:?}", other);
                }
            };
        }

        let delay = match has_data {
            false => Duration::from_millis(500),
            true => Duration::ZERO,
        };

        // Delay or wait for SIGINT
        tokio::select! {
            _ = interrupt_signal.recv() => break,
            _ = sleep(delay) => {}
        }
    }

    println!("Finished polling after SIGINT, unregistering and committing final consumer offsets");

    // Unregister and commit the last position for other consumer instances of the same group to resume where it left off
    let uri = format!(
        "http://{service_name}:{CONSUMER_PORT}/v1/goodbye/register?consumerId={CONSUMER_ID}"
    );
    client.post(uri).send().await?;

    println!("Exiting");
    Ok(())
}

struct Discovery {
    brokers: Vec<String>,
}

impl Discovery {
    async fn new(service_name: &str) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        // Load the brokers. Consider doing it from time to time if you use a HPA
        let client = Client::new();
        let uri = format!("http://{service_name}:{DISCOVERY_PORT}/v1/brokers");
        let topology: Topology = client.get(&uri).send().await?.json().await?;
        let base_name = topology.base_name.unwrap_or_default();
        let service_name = topology.service_name.unwrap_or_default();
        let brokers = topology.names.unwrap_or_else(|| {
            let mut brokers = vec![];
            for n in 0..topology.length {
                brokers.push(format!("{}{}.{}", &base_name, n, &service_name));
            }
            brokers
        });

        Ok(Discovery { brokers })
    }
}

#[derive(Deserialize, Debug)]
struct Topology {
    length: usize,
    names: Option<Vec<String>>,
    #[serde(rename = "baseName")]
    base_name: Option<String>,
    #[serde(rename = "serviceName")]
    service_name: Option<String>,
}

#[serde_as]
#[allow(dead_code)]
#[derive(Deserialize)]
struct ConsumerResponse {
    topic: String,
    #[serde_as(as = "DisplayFromStr")]
    token: i64,
    version: usize,
    #[serde(rename = "rangeIndex")]
    range_index: usize,
    #[serde(rename = "startOffset")]
    #[serde_as(as = "DisplayFromStr")]
    start_offset: i64,
    values: Vec<HashMap<String, String>>,
}
