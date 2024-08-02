const {
  getPresignedPutObject,
  listBuckets,
  makeBucket,
} = require('../service/storage.js')

const MinioController = {
  getPresignedUrl: async (req, res) => {
    const key = req.body.key
    console.log('key: ', key)
    try {
      const { url } = await getPresignedPutObject(key)
      console.log('presigned url = ' + url)
      return res.json({
        url,
      })
    } catch (err) {
      console.error(err)
      return res.status(400).json({
        message: 'Error: get presigned upload link fails!',
      })
    }
  },

  makeBucket: async (req, res) => {
    const name = req.body.name
    console.log('name: ', name)
    try {
      await makeBucket(name)
      return res.json({
        message: 'Success: make bucket!',
      })
    } catch (err) {
      console.error(err)
      return res.status(400).json({
        message: 'Error: make bucket fails!',
      })
    }
  },

  listBuckets: async (req, res) => {
    try {
      const buckets = await listBuckets()
      console.log('buckets: ', buckets)
      return res.json({
        buckets,
      })
    } catch (err) {
      console.error(err)
      return res.status(400).json({
        message: 'Error: get bucket list',
      })
    }
  },
}

module.exports = MinioController
