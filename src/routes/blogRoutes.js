const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/blogController');

router.get('/', BlogController.index);
router.post('/', BlogController.store);

module.exports = router;
