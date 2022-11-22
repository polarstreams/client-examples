# Producing and consuming messages on Barco Streams with Python

This repository contains an example about how to [produce](./producing/) messages on Barco Streams with Python.

## Compatibility

- Python 3.
- Barco Streams v0.5.0 and above.

## Producing

Set the service name to `{my-service}.{my-namespace}` or `localhost` if you are running Barco locally.

```shell
cd producing
python -m pip install requests # Install requests in your Python env
BARCO_EXAMPLE_SERVICE_NAME=barco.streams python example.py
```
