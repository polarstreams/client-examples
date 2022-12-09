import os
import requests

# The port number of the PolarStreams producer interface
PRODUCER_PORT = 9251
TOPIC = 'my-topic'

# In Kubernetes, the PolarStreams service is a headless service that resolves to the PolarStreams broker addresses.
service_name = os.getenv('POLAR_EXAMPLE_SERVICE_NAME')
service_name = 'polar.streams' if service_name is None else service_name

r = requests.get(f'http://{service_name}:{PRODUCER_PORT}/status')
print(r.text.strip())

r = requests.post(f'http://{service_name}:{PRODUCER_PORT}/v1/topic/{TOPIC}/messages', json={'hello': 'world'})
print('Message produced', r.text)
