const Minio = require('minio')
const config = require('../../config')

// const minioClient = new Minio.Client(
//   'https://minio.wowstk.com',
//   'RJVpAUnWdE0eSQo4',
//   'EpWaVPR5Kqpr1eDX3kBkLB6dOH9R27Y1',
// );

const minioConfig = {
  endPoint: config.MINIO_ENDPOINT,
  port: config.MINIO_PORT,
  useSSL: true, // Set to true if MinIO server is configured with SSL/TLS
  accessKey: config.MINIO_ACCESS_KEY,
  secretKey: config.MINIO_SECRET_KEY,
}
console.log('minioConfig: ', minioConfig)

const minioClient = new Minio.Client(minioConfig)

// const minioClient = new Minio.Client({
//   endPoint: 'minio.wowstk.com',
//   port: 443,
//   useSSL: false, // Set to true if MinIO server is configured with SSL/TLS
//   accessKey: 'RJVpAUnWdE0eSQo4',
//   secretKey: 'EpWaVPR5Kqpr1eDX3kBkLB6dOH9R27Y1',
// })

const listBuckets = async () => {
  try {
    const buckets = await minioClient.listBuckets({ recursive: true })
    return buckets
  } catch (err) {
    throw err
  }
}

const makeBuckets = async (names) => {
  try {
    for (let i = 0; i < names.length; i++) {
      await makeBucket(names[i])
    }
  } catch (err) {
    throw err
  }
}

const makeBucket = async (name) => {
  try {
    await minioClient.makeBucket(name)
  } catch (err) {
    if (err.name === 'InvalidBucketNameError') {
      console.log('*** Invalid bucket name')
    } else if (err.code === 'BucketAlreadyOwnedByYou') {
      console.log(`*** "${name}" Bucket already exists`)
    } else {
      console.log(1)
      console.log('err: ', JSON.stringify(err))
      throw err
      console.log(1)
    }
  }
}

const removeFileInPath = async (filePath) => {
  try {
    const [bucketName, ...segments] = filePath.split('/')
    const objectName = segments.join('/')
    await minioClient.removeObject(bucketName, objectName)
  } catch (err) {
    throw err
  }
}
const removeFile = async (bucketName, fileName) => {
  try {
    await minioClient.removeObject(bucketName, fileName)
  } catch (err) {
    throw err
  }
}

const removeAllFiles = async (bucketName) => {
  return new Promise((resolve, reject) => {
    const objectList = []
    const objectStream = minioClient.listObjects(bucketName, '', true)
    objectStream.on('data', (obj) => {
      objectList.push(obj)
    })
    objectStream.on('error', (err) => {
      reject(err)
    })
    objectStream.on('end', () => {
      minioClient.removeObjects(bucketName, objectList, (err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
  })
}

const removeObject = async (bucketName, objectName) => {
  try {
    await minioClient.removeObject(bucketName, objectName)
  } catch (err) {
    throw err
  }
}

const removeBucket = async (bucketName, includeObjects = false) => {
  try {
    if (await minioClient.bucketExists(bucketName)) {
      if (includeObjects) {
        // console.log('delete all objects')
        const objects = [{ name: '' }] // empty object name to delete all objects
        const result = await removeAllFiles(bucketName)
      }
      await minioClient.removeBucket(bucketName)
    }
  } catch (err) {
    throw err
  }
}
const removeBuckets = async (names, includeObjects = false) => {
  try {
    console.log(
      `removeBuckets: names=${names.join(
        ', '
      )}  includeObjects=${includeObjects}`
    )
    for (let i = 0; i < names.length; i++) {
      await removeBucket(names[i], includeObjects)
    }
  } catch (err) {
    throw err
  }
}

const getPresignedPutObject = async (key) => {
  const bucketName = 'upload'
  const objectName = key
  const expiryInSeconds = 60 * 60 // URL expiration time in seconds (1 hour in this example)

  // const uploadUrl = 'xxx';
  console.log(`presignedPutObject: bucketName = ${bucketName}`)
  console.log(`presignedPutObject: objectName = ${objectName}`)
  console.log(`presignedPutObject: expiryInSeconds = ${expiryInSeconds}`)

  return new Promise((resolve, reject) => {
    minioClient.presignedPutObject(
      bucketName,
      objectName,
      expiryInSeconds,
      (err, url) => {
        if (err) {
          reject(err)
        }
        resolve({ url })
      }
    )
  })
}

const uploadFile = async (bucketName, objectName, filePath, metaData) => {
  try {
    const result = await minioClient.fPutObject(
      bucketName,
      objectName,
      filePath,
      metaData
    )
    return result
  } catch (err) {
    throw err
  }
}
const getObjects = async (bucketName, prefix) => {
  return new Promise((resolve, reject) => {
    const data = []
    const stream = minioClient.listObjects(bucketName, prefix, true)
    stream.on('data', (obj) => {
      data.push(obj)
    })
    stream.on('error', (err) => {
      reject(err)
    })

    stream.on('end', () => {
      resolve(data)
    })
  })
}

const moveFile = async (sourceFilePath, targetFilePath) => {
  try {
    const [targetBucketName, ...segments] = targetFilePath.split('/')
    const targetObjectName = `${segments.join('/')}`

    // const targetObjectName = `${targetFolderName}/${fileName}`
    const sourceBucketObjectName = sourceFilePath
    const conds = new Minio.CopyConditions()
    const result = await minioClient.copyObject(
      targetBucketName,
      targetObjectName,
      sourceBucketObjectName,
      conds
    )
    await removeFileInPath(sourceFilePath)
    return result
  } catch (err) {
    throw err
  }
}

const moveFileInBucket = async (bucketName, sourceFilePath, targetFilePath) => {
  // console.log(`moveFileInBucket: bucketName = ${bucketName}`)
  // console.log(`moveFileInBucket: sourceFilePath = ${sourceFilePath}`)
  // console.log(`moveFileInBucket: targetFilePath = ${targetFilePath}`)
  try {
    const targetBucketName = bucketName
    const targetObjectName = targetFilePath
    const sourceBucketObjectName = `/${bucketName}/${sourceFilePath}`
    const conds = new Minio.CopyConditions()

    // console.log(`copyObject: targetBucketName = ${targetBucketName}`)
    // console.log(`copyObject: targetObjectName = ${targetObjectName}`)
    // console.log(
    //   `copyObject: sourceBucketObjectName = ${sourceBucketObjectName}`
    // )
    const result = await minioClient.copyObject(
      targetBucketName,
      targetObjectName,
      sourceBucketObjectName,
      conds
    )
    await removeFile(bucketName, sourceFilePath)
    return result
  } catch (err) {
    throw err
  }
}

const getSignedUrl = async (bucketName, filePath, expiry, options = {}) => {
  try {
    const url = await minioClient.presignedUrl(
      'GET',
      bucketName,
      filePath,
      expiry,
      options
    )
    return url
  } catch (err) {
    throw err
  }
}

const getObjectsV2 = async (bucketName, prefix, recursive = true) => {
  return new Promise((resolve, reject) => {
    const result = []
    const stream = minioClient.listObjects(bucketName, prefix, recursive)
    stream.on('data', (obj) => {
      result.push(obj)
    })
    stream.on('error', (err) => {
      reject(err)
    })
    stream.on('end', (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

const getBucketLifecycle = async (bucketName) => {
  try {
    const result = await minioClient.getBucketLifecycle(bucketName)
    return result
  } catch (err) {
    console.log(err.code)
    if (err.code === 'NoSuchLifecycleConfiguration') {
      console.log('No lifecycle configuration found for bucket:', bucketName)
    } else {
      console.log('Unknown error!')
    }
    return null
  }
}

const setBucketLifecycle = async (bucketName, lifecycleConfig) => {
  try {
    const result = await minioClient.setBucketLifecycle(
      bucketName,
      lifecycleConfig
    )
    return result
  } catch (err) {
    // console.log('err: ', err)
    // console.log('err.code: ', err.code)

    if (err.code === 'NoSuchlifecycleConfiguration') {
      console.log('No lifecycle configuration found for bucket:', bucketName)
    } else {
      console.log('Unknown error!')
    }
    return null
  }
}

const getDownloadUrl = async (
  bucketName,
  objectName,
  expiry,
  respHeaders = {}
) => {
  const statInfo = await getMetadata(bucketName, objectName)
  let downloadFileName = ''
  console.log('getDownloadUrl: statInfo: ', statInfo)
  if (statInfo?.metaData) {
    downloadFileName = statInfo.metaData['original-filename']
  }
  console.log(`getDownloadUrl: downloadFilename = ${downloadFileName}`)
  if (
    !('response-content-disposition' in respHeaders) ||
    respHeaders['response-content-disposition'].indexOf('filename=') < 0
  ) {
    if (downloadFileName) {
      respHeaders[
        'response-content-disposition'
      ] = `attachment; filename="${downloadFileName}"`
    }
  }
  console.log('getDownloadUrl: respHeaders: ', respHeaders)

  try {
    const result = await minioClient.presignedGetObject(
      bucketName,
      objectName,
      expiry,
      respHeaders
    )
    return result
  } catch (err) {
    console.log(err.code)
    if (err.code === 'NoSuchBucket') {
      console.log('Bucket does not exist')
    }
    throw err
  }
}

const updateMetadata = async (bucketName, objectName, meta) => {
  try {
    const conds = new Minio.CopyConditions()
    const options = {
      conditions: conds,
      metadata: meta,
    }
    const result = await minioClient.copyObject(
      bucketName,
      objectName,
      `${bucketName}/${objectName}`,
      options
    )
    return result
  } catch (err) {
    throw err
  }
}

const getMetadata = async (bucketName, objectName) => {
  try {
    const result = await minioClient.statObject(bucketName, objectName)
    return result
  } catch (err) {
    throw err
  }
}

const setBucketPublic = async (bucketName, prefix) => {
  try {
    await minioClient.setBucketPolicy(
      bucketName,
      JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadForGetBucketObjects',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/${prefix}*`,
          },
        ],
      })
    )
  } catch (err) {
    throw err
  }
}

module.exports = {
  listBuckets,
  makeBucket,
  makeBuckets,
  removeBucket,
  removeBuckets,

  removeFileInPath,
  removeFile,
  removeAllFiles,
  getObjects,

  uploadFile,
  getPresignedPutObject,
  getSignedUrl,
  moveFile,
  moveFileInBucket,

  getObjectsV2,
  getBucketLifecycle,
  setBucketLifecycle,
  getDownloadUrl,
  updateMetadata,
  getMetadata,
  setBucketPublic,
}
