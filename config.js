const dotenv = require('dotenv')
dotenv.config()

const config = {
  PORT: parseInt(process.env.PORT) || 3000,
  DB_URL: process.env.DB_URL,
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
  MINIO_PORT: parseInt(process.env.MINIO_PORT),
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,    
}

module.exports = config;
