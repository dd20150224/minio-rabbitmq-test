const express = require('express')
const router = express.Router()
const rabbitController = require('../controllers/RabbitController')

// Publish a message to RabbitMQ
router.post('/publish', rabbitController.publishMessage)

// Start consuming messages from RabbitMQ
router.get('/consume', rabbitController.consumeMessages)

module.exports = router
