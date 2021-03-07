'use strict'

const SERVICE_NAME = 'distribution-center'
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')

const { Kafka } = require('kafkajs')
const { v4: uuidv4 } = require('uuid')

async function main() {
    console.log('connecting to kafka', KAFKA_BROKERS)
    const kafka = new Kafka({
        clientId: SERVICE_NAME,
        brokers: KAFKA_BROKERS
    })

    const producer = kafka.producer()
    await producer.connect()

    while (true) {
        await produce_scan_event(producer)
        // Sleep:
        await new Promise((res) => setTimeout(() => res(), 10000))
    }
}

let parcelId = 0
async function produce_scan_event(producer) {
    // A new parcelId everytime:
    parcelId += 1

    // The outbound cloudevent:
    const key = parcelId
    const event = {
        specversion: '0.2',
        id: uuidv4(),
        source: SERVICE_NAME,
        type: 'parcel scanned',
        time: new Date().toISOString(),
        data: {
            parcelId,
            distributionCenter: '4005'
        }
    }
    console.log('sending', {
        key,
        event: JSON.stringify(event)
    })
    await producer.send({
        topic: 'scanned',
        messages: [
            { key, value: JSON.stringify(event) }
        ]
    })
}

main().then(console.log).catch(console.error);
