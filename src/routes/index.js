const express = require('express');
const rabbitRoutes = require('./rabbitRoutes');
const blogRoutes = require('./blogRoutes');
const crmRoutes = require('./crmRoutes');
const minioRoutes = require('./minioRoutes');

const router = express.Router()

router.use('/rabbit', rabbitRoutes)
router.use('/blogs', blogRoutes)
router.use('/crm',  crmRoutes);
router.use('/minio', minioRoutes);

module.exports = router
