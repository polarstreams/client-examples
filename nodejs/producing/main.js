'use strict'

import got from 'got'

// The port number of the Barco producer interface
const producerPort = 9251
const topic = 'my-topic'

// In Kubernetes, the Barco service is a headless service that resolves to the Barco broker addresses.
const serviceName = process.env['BARCO_EXAMPLE_SERVICE_NAME'] ?? 'barco.streams'

async function main() {
  // Check the status of one of the brokers
  const status = await got(`http://${serviceName}:${producerPort}/status`, {timeout: {connect: 200}}).text()
  console.log(status.trim())

  // Send a message
  const response = await got
    .post(`http://${serviceName}:${producerPort}/v1/topic/${topic}/messages`, {json: {hello: 'world'}})
    .text()
  console.log('Message produced', response)
}

main()
  .catch(err => console.error('Execution resulted in error', err.message, err.stack))
  .then(() => console.log('Example finished'))
