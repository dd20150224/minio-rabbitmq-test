const mongoose = require('mongoose');
const schema = mongoose.schema;

const blogSchema = new schema({
  title: String,
  author: String,
  body: String,
})

module.exports = blogSchema;
