const express = require('express')
const router = express.Router()
const MinioController = require('../controllers/minioController')

router.post('/get-presigned-url', MinioController.getPresignedUrl)
router.get('/list-buckets', MinioController.listBuckets)
router.post('/buckets', MinioController.makeBucket)
module.exports = router
