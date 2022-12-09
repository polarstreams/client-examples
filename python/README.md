# Producing and consuming messages on PolarStreams with Python

This repository contains an example about how to [produce](./producing/) messages on PolarStreams with Python.

## Compatibility

- Python 3.
- PolarStreams v0.5.0 and above.

## Producing

Set the service name to `{my-service}.{my-namespace}` or `localhost` if you are running PolarStreams locally.

```shell
cd producing
python -m pip install requests # Install requests in your Python env
POLAR_EXAMPLE_SERVICE_NAME=polar.streams python example.py
```
