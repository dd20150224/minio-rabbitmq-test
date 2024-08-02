const dotenv = require('dotenv');
dotenv.config();

const amqp = require('amqplib')

const exchange = 'my_exchange'
const routingKey = 'my_routing_key'

let channel

const connect = async () => {
  try {
    const connection = await amqp.connect(process.env.QUEUE_URL);    
    channel = await connection.createChannel()
    await channel.assertExchange(exchange, 'direct', { durable: false })
    await channel.assertQueue('', { exclusive: true })
    await channel.bindQueue(channel.queue, exchange, routingKey)
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error)
    throw error
  }
}

const publishMessage = async (message) => {
  try {
    console.log('message = ' + message);
    await channel.publish(exchange, routingKey, Buffer.from(message))
    console.log('Message published to RabbitMQ:', message)
  } catch (error) {
    console.error('Error publishing message to RabbitMQ:', error)
    throw error
  }
}

const consumeMessages = (consumeCallback) => {
  try {
    channel.consume(channel.queue, (msg) => {
      const message = msg.content.toString()
      consumeCallback(message)
      channel.ack(msg)
    })
    console.log('Consuming messages from RabbitMQ')
  } catch (error) {
    console.error('Error consuming messages from RabbitMQ:', error)
    throw error
  }
}

module.exports = {
  connect,
  publishMessage,
  consumeMessages,
}
