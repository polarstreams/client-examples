'use strict'

import got from 'got'
import { setTimeout } from 'timers/promises';

const consumerPort = 9252 // The port number of the Barco consumer interface
const discoveryPort = 9250 // The port number of the Barco discovery interface
const topic = 'my-topic'
const consumerGroup = 'my-group'
const consumerId = 'c1' // A unique id of the client in the cluster, uuids or the application instance id are good a fit

// In Kubernetes, the Barco service is a headless service that resolves to the Barco broker addresses.
const serviceName = process.env['BARCO_EXAMPLE_SERVICE_NAME'] ?? 'barco.streams'

async function main() {
  const baseUrl = `http://${serviceName}:${consumerPort}`

  // Check the status of the consumer service on one of the brokers
  const status = await got(`${baseUrl}/status`, {timeout: {connect: 200}}).text()
  console.log(status.trim())

  // Get the size of the cluster and the host names
  const discovery = new Discovery()
  await discovery.start()
  console.log(`Discovered ${discovery.hosts.length} broker(s)`)

  let finished = false
  process.on('SIGINT', () => finished = true)

  // Register the consumer using an unique consumer id and the group it belongs to
  await got.put(`${baseUrl}/v1/consumer/register?consumerId=${consumerId}&group=${consumerGroup}&topic=${topic}`)

  console.log(`Starting to poll for data, use Ctrl+C to exit`)

  while (!finished) {
    let hasData = false
    for (const broker of discovery.hosts) {
      const brokerUrl = `http://${broker}:${consumerPort}`
      const items = await got
        .post(`${brokerUrl}/v1/consumer/poll?consumerId=${consumerId}`, { headers: { 'Accept': 'application/json' }})
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

  console.log('Finished polling after SIGINT, unregistering and committing final consumer offsets')

  // Unregister and commit the last position for other consumer instances of the same group to resume where it left off
  await got.post(`${baseUrl}/v1/consumer/goodbye?consumerId=${consumerId}`)
  console.log('Exiting example')
}

/** Encapsulates discovery logic */
class Discovery {
  hosts = []

  async start() {
    await this.#loadBrokers()
    // Check for the topology from time to time
    this.#refreshHostsInTheBackground().catch(err => console.error('Discovery refresh failed', err.message, err.stack))
  }

  async #refreshHostsInTheBackground() {
    await setTimeout(30000, null, { ref: false })
  }

  async #loadBrokers() {
    let hosts = []
    const topology = await got(`http://${serviceName}:${discoveryPort}/v1/brokers`).json()
    if (topology?.names?.length) {
      hosts = topology.names
    } else {
      for (let i = 0; i < topology.length; i++) {
        hosts.push(`${topology.baseName}${i}.${topology.serviceName}`)
      }
    }

    this.hosts = hosts
  }
}

main()
  .catch(err => console.error('Execution resulted in error', err.message, err.stack))
