const rabbitmq = require('../../rabbitmq')
// const User = require('../models/userModel')

// Publish a message to RabbitMQ
const publishMessage = async (req, res) => {
  console.log('publishMessage: req.body: ', req.body)
  try {
    const { message } = req.body

    await rabbitmq.publishMessage(message)

    res.status(200).json({ message: 'Message published to RabbitMQ' })
  } catch (error) {
    console.error('Error publishing message to RabbitMQ:', error)
    res.status(500).json({ error: 'Failed to publish message to RabbitMQ' })
  }
}

// Consume messages from RabbitMQ and save them to the database
const consumeMessages = async (req, res) => {
  try {
    rabbitmq.consumeMessages(async (message) => {
      // Process the received message and save it to the database
      // const user = new User({ message })
      // await user.save()

      console.log(`Message saved to the database: ${message}`)
    })

    res.status(200).json({ message: 'Consuming messages from RabbitMQ' })
  } catch (error) {
    console.error('Error consuming messages from RabbitMQ:', error)
    res.status(500).json({ error: 'Failed to consume messages from RabbitMQ' })
  }
}

module.exports = {
  publishMessage,
  consumeMessages,
}
