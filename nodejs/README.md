# Producing and consuming messages on Barco Streams with Node.js

This repository contains concise examples about how to [produce](./producing/) and [consume](./consuming/) messages
on Barco Streams with Node.js.

## Compatibility

- Node.js 16 and above.
- Barco Streams v0.5.0 and above.

## Producing

Set the service name to `{my-service}.{my-namespace}` or `localhost` if you are running Barco locally.

```shell
cd producing
npm install
BARCO_EXAMPLE_SERVICE_NAME=barco.streams node main.js
```

## Consuming

Set the service name to `{my-service}.{my-namespace}` or `localhost` if you are running Barco locally.

```shell
cd consuming
npm install
BARCO_EXAMPLE_SERVICE_NAME=barco.streams node main.js
```
