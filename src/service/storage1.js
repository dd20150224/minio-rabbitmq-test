const AWS = require('aws-sdk')

const s3 = new AWS.S3({
  accessKeyId: 'RJVpAUnWdE0eSQo4',
  secretAccessKey: 'EpWaVPR5Kqpr1eDX3kBkLB6dOH9R27Y1',
  endpoint: 'https://minio.wowstk.com',
  s3ForcePathStyle: true, // needed with minio?
  signatureVersion: 'v4',
})

const getPresignedPutObject = async (fileName) => {
  return fileName;
}


module.exports = {
  getPresignedPutObject,
}
