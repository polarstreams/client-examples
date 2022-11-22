# Producing and consuming messages on Barco Streams with Rust

This repository contains an example about how to [produce](./producing/) and [consume](./consuming/) messages on
Barco Streams with Rust.

## Compatibility

- Rust 1.62 and above.
- Barco Streams v0.5.0 and above.

## Producing

Set the service name to `{my-service}.{my-namespace}` or `localhost` if you are running Barco locally.

```shell
cd producing
BARCO_EXAMPLE_SERVICE_NAME=barco.streams cargo run
```

## Consuming

Set the service name to `{my-service}.{my-namespace}` or `localhost` if you are running Barco locally.

```shell
cd consuming
BARCO_EXAMPLE_SERVICE_NAME=barco.streams cargo run
```
