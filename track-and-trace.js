'use strict'

const SERVICE_NAME = 'track-and-trace'
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

    const consumer = kafka.consumer({ groupId: SERVICE_NAME })
    await consumer.connect()
    await consumer.subscribe({ topic: 'scanned' })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const body = JSON.parse(message.value.toString())
            console.log('\nreceived', {
                key: message.key.toString(),
                body,
                headers: message.headers
            })
            const parcelId = body.data.parcelId

            // Wait to simulate processing:
            console.log('processing..')
            await new Promise((res) => setTimeout(() => res(), 3000))

            // The outbound cloudevent:
            const key = parcelId
            const new_event = {
                specversion: '0.2',
                id: uuidv4(),
                source: SERVICE_NAME,
                type: 'parcel entered country',
                time: new Date().toISOString(),
                data: {
                    parcelId,
                    country: 'Austria'
                }
            }
            console.log('sending', {
                key,
                body: new_event
            })
            await producer.send({
                topic: 'parcelcrossedborder',
                messages: [
                    { key, value: JSON.stringify(new_event) }
                ]
            })
        },
    })
}

main().then(console.log).catch(console.error);
