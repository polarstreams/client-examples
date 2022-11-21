'use strict'

import got from 'got'
import { setTimeout } from 'timers/promises';

const consumerPort = 9252 // The port number of the Barco consumer interface
const discoveryPort = 9250 // The port number of the Barco discovery interface
const topic = 'my-topic'
const consumerGroup = 'my-group'
const consumerId = 'c1' // A unique id of teh client in the cluster, uuids or the application instance id are good a fit

// In Kubernetes, the Barco service is a headless service that resolves to the Barco broker addresses.
const serviceName = process.env['BARCO_EXAMPLE_SERVICE_NAME'] ?? 'barco.streams'

// Holds information of the cluster
const discovery = setupDiscovery()

async function main() {
  const baseUrl = `http://${serviceName}:${consumerPort}`

  // Check the status of one of the brokers
  const status = await got(`${baseUrl}/status`, {timeout: {connect: 200}}).text()
  console.log(status.trim())

  // Get the size of the cluster
  await discovery.start()
  console.log(`Discovered ${discovery.hosts.length} broker(s)`)

  let finished = false
  process.on('SIGINT', () => finished = true)

  // Register the consumer using an unique consumer id and the group it belongs to
  await got.put(`${baseUrl}/v1/consumer/register?consumerId=${consumerId}&group=${consumerGroup}&topic=${topic}`)

  console.log(`Starting to poll for data, use Ctrl+C to exit`)

  while (!finished) {
    let hasData = false
    for (let i = 0; i < discovery.hosts.length; i++) {
      const items = await got
        .post(`${baseUrl}/v1/consumer/poll?consumerId=${consumerId}`, { headers: { 'Accept': 'application/json' }})
        .json()

      if (items) {
        hasData = true
        for (const responseItem of items) {
          // Do something with the data...
          for (const event of responseItem.values) {
            console.log('Received event', event)
          }
        }
      }
    }

    if (!hasData) {
      // The last poll didn't return any data
      await setTimeout(500)
    }
  }

  console.log('Finished polling after SIGINT, committing final consumer offsets')

  // Manually commit the last position for other consumers to resume where it left off
  await got.post(`${baseUrl}/v1/consumer/commit?consumerId=${consumerId}`)
  console.log('Exiting example')
}

function setupDiscovery() {
  let finished = false
  const info = {
    hosts: [],
    shutdown: () => { finished = true },
    start: async () => {
      info.hosts = await getBrokers()
      // Start discovering in the background
      refreshHostsInLoop().catch(err => console.error('Discovery failed', err.message, err.stack))
    }
  }

  async function refreshHostsInLoop() {
    while (!finished) {
      info.hosts = await getBrokers()
      await setTimeout(30000, null, { ref: false })
    }
  }

  return info
}

async function getBrokers() {
  let hosts = []
  // Check for the topology from time to time
  const topology = await got(`http://${serviceName}:${discoveryPort}/v1/brokers`).json()
  if (topology?.names?.length) {
    hosts = topology.names
  } else {
    for (let i = 0; i < topology.length; i++) {
      hosts.push(`${topology.baseName}${i}.${topology.serviceName}`)
    }
  }
  return hosts
}

main()
  .catch(err => console.error('Execution resulted in error', err.message, err.stack))
  .then(() => {
    discovery.shutdown()
  })
