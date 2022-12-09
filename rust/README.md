# Producing and consuming messages on PolarStreams with Rust

This repository contains an example about how to [produce](./producing/) and [consume](./consuming/) messages on
PolarStreams with Rust.

## Compatibility

- Rust 1.62 and above.
- PolarStreams v0.5.0 and above.

## Producing

Set the service name to `{my-service}.{my-namespace}` or `localhost` if you are running PolarStreams locally.

```shell
cd producing
POLAR_EXAMPLE_SERVICE_NAME=polar.streams cargo run
```

## Consuming

Set the service name to `{my-service}.{my-namespace}` or `localhost` if you are running PolarStreams locally.

```shell
cd consuming
POLAR_EXAMPLE_SERVICE_NAME=polar.streams cargo run
```
