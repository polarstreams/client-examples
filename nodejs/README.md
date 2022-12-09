# Producing and consuming messages on PolarStreams with Node.js

This repository contains concise examples about how to [produce](./producing/) and [consume](./consuming/) messages
on PolarStreams with Node.js.

## Compatibility

- Node.js 16 and above.
- PolarStreams v0.5.0 and above.

## Producing

Set the service name to `{my-service}.{my-namespace}` or `localhost` if you are running PolarStreams locally.

```shell
cd producing
npm install
POLAR_EXAMPLE_SERVICE_NAME=polar.streams node main.js
```

## Consuming

Set the service name to `{my-service}.{my-namespace}` or `localhost` if you are running PolarStreams locally.

```shell
cd consuming
npm install
POLAR_EXAMPLE_SERVICE_NAME=polar.streams node main.js
```
