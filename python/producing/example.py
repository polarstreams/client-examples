import os
import requests

# The port number of the Barco producer interface
PRODUCER_PORT = 9251
TOPIC = 'my-topic'

# In Kubernetes, the Barco service is a headless service that resolves to the Barco broker addresses.
service_name = os.getenv('BARCO_EXAMPLE_SERVICE_NAME')
service_name = 'barco.streams' if service_name is None else service_name

r = requests.get(f'http://{service_name}:{PRODUCER_PORT}/status')
print(r.text.strip())

r = requests.post(f'http://{service_name}:{PRODUCER_PORT}/v1/topic/{TOPIC}/messages', json={'hello': 'world'})
print('Message produced', r.text)
