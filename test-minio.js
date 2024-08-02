const {
  listBuckets,
  makeBucket,
  makeBuckets,
  removeBucket,
  removeBuckets,

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
} = require('./src/service/storage.js')
const path = require('path')
const dayjs = require('dayjs')

let count = 1
let originalBucketNames = []

const INCLUDE_OBJECTS = true

const BUCKET_NAME1 = 'minio-test'
const BUCKET_NAME2 = 'minio-test2'
const BUCKET_NAME3 = 'minio-test3'

const WORKING_BUCKET_NAMES = [BUCKET_NAME1, BUCKET_NAME2, BUCKET_NAME3]

const FOLDER_NAME = 'folder1'
const TARGET_FOLDER_NAME = FOLDER_NAME

const FILE_NAME1 = 'dog.jpeg'
const FILE_NAME2 = 'cat.jpeg'

const OBJECT_NAME1 = 'public_dog'
const OBJECT_NAME2 = 'cat'
const DOWNLOAD_OBJECT_NAME = '東南西北.jpeg'

const IMAGE_PATH = path.join(__dirname, FILE_NAME1)
let imageMetaData = {}

const EXPIRY_60S = 60

let signedUrl = ''
let lifecycle = null

// show title
const showTitle = (title) => {
  console.log(`\n${count++}: ${title}`)
}

const log = (message) => {
  console.log(message)
}

// list buckets
const showBuckets = async () => {
  const allBuckets = await listBuckets()
  const buckets = allBuckets.filter(
    (bucket) => !originalBucketNames.includes(bucket.name)
  )
  if (buckets.length > 0) {
    for (let i = 0; i < buckets.length; i++) {
      const loopBucket = buckets[i]
      const objects = await getObjects(loopBucket.name)
      const createdAt = dayjs(loopBucket.creationDate)

      console.log(
        `Bucket #${i + 1}: ${loopBucket.name} [${createdAt.format(
          'YYYY-MM-DD HH:mm:ss'
        )}]`
      )
      // log(`showBuckets: objects ${objects.length}: `, JSON.stringify(objects))
      for (let j = 0; j < objects.length; j++) {
        log(`           ${loopBucket.name}/${objects[j].name}`)
      }
    }
  } else {
    console.log('(no bucket)')
  }
}

const main = async () => {
  await removeBuckets(
    ['upload2', 'upload3', ...WORKING_BUCKET_NAMES],
    INCLUDE_OBJECTS
  )
  originalBucketNames = (await listBuckets()).map((bucket) => bucket.name)

  console.log('**********************')
  await showBuckets()
  console.log('**********************')
  console.log()

  console.log('Minio Test')
  console.log('==========')

  let count = 1
  // Show buckets
  showTitle('List Buckets')
  await showBuckets()

  // add bucket
  showTitle(`Add bucket: ${WORKING_BUCKET_NAMES.join(', ')}`)
  log('- must lowercase letters, numbers, period and hyphens')
  log('- must start with a letter or number')
  log('- must be between 3 and 63 characters')
  await makeBuckets(WORKING_BUCKET_NAMES)
  await showBuckets()

  // set bucket policy for public read-access to objects prefix with "public_"
  showTitle(
    `Set bucket policy for public read-only to objects prefix with "public_"`
  )
  await setBucketPublic(BUCKET_NAME1, 'public_')
  console.log(
    'Bucket policy set to public read-only for files with prefix "public_" in bucket "${BUCKET_NAME1}"'
  )

  // remove bucket
  showTitle(`Remove bucket "${BUCKET_NAME3}"`)
  await removeBucket(BUCKET_NAME3, INCLUDE_OBJECTS)
  await showBuckets()

  // upload file
  showTitle(`Upload File: ${IMAGE_PATH} to bucket "${BUCKET_NAME1}"`)
  imageMetaData = {
    'Content-Type': 'image/jpeg',
    'X-Amz-Meta-Original-Filename': FILE_NAME1,
  }

  await uploadFile(BUCKET_NAME1, OBJECT_NAME1, IMAGE_PATH, imageMetaData)
  await showBuckets()

  // Move file to folder
  showTitle(
    `move file "${OBJECT_NAME1}" in bucket "${BUCKET_NAME1}" to Folder "${TARGET_FOLDER_NAME}"`
  )
  await moveFileInBucket(
    BUCKET_NAME1,
    OBJECT_NAME1,
    `${TARGET_FOLDER_NAME}/${OBJECT_NAME1}`
  )
  await showBuckets()

  // Move file between buckets
  const sourcePath = `${BUCKET_NAME1}/${FOLDER_NAME}/${OBJECT_NAME1}`
  const targetPath = `${BUCKET_NAME2}/${FOLDER_NAME}/${OBJECT_NAME1}`
  showTitle(`move file from "${sourcePath}" to "${targetPath}"`)
  await moveFile(sourcePath, targetPath)
  await showBuckets()

  // rename file
  const sourceFilePath = `${FOLDER_NAME}/${OBJECT_NAME1}`
  const targetFilePath = `${FOLDER_NAME}/${OBJECT_NAME2}`
  showTitle(`rename file "${sourceFilePath}" to "${targetFilePath}"`)
  await moveFileInBucket(BUCKET_NAME2, sourceFilePath, targetFilePath)
  await showBuckets()

  // rename original filename in meta data
  // showTitle(
  //   `rename original filename "${sourceFilePath}" to "${targetFilePath}" in meta data`
  // )
  // await updateMetadata(BUCKET_NAME2, targetFilePath, {
  //   'Content-Type': 'image/jpeg',
  //   'X-Amz-Meta-Original-Filename': FILE_NAME2,
  // })
  // console.log(
  //   `Metadata for "${targetFilePath}" in bucket "${BUCKET_NAME2}" is updated.`
  // )

  // show meta data of minio-test2/folder1/cat.jpeg
  showTitle(`show meta data of "${targetFilePath}" in bucket "${BUCKET_NAME2}`)
  const metaData = await getMetadata(BUCKET_NAME2, targetFilePath)
  console.log(metaData)

  // Upload a file to bucket "minio-test"
  showTitle(`Upload File: ${IMAGE_PATH}`)
  imageMetaData = {
    'Content-Type': 'image/jpeg',
    'X-Amz-Meta-Original-Filename': FILE_NAME1,
  }
  await uploadFile(BUCKET_NAME1, OBJECT_NAME1, IMAGE_PATH, imageMetaData)
  await showBuckets()

  // Get signed url for the file minio-test2/folder1/cat.jpeg
  showTitle(
    `Get signed Url for "${BUCKET_NAME2}/${FOLDER_NAME}/${OBJECT_NAME2}"`
  )
  log('- expiry, in seconds')
  signedUrl = await getSignedUrl(
    BUCKET_NAME2,
    `${FOLDER_NAME}/${OBJECT_NAME2}`,
    EXPIRY_60S
  )
  log(`Signed URL = ${signedUrl}`)

  // Get signed url for object list
  showTitle(`Get signed Url for list objects in "${BUCKET_NAME2}"`)
  log('- expiry, in seconds')
  signedUrl = await getSignedUrl(BUCKET_NAME2, '', EXPIRY_60S, {
    prefix: FOLDER_NAME,
    'max-keys': 1000,
  })
  log(`Signed URL = ${signedUrl}`)

  // listObjectsV2
  showTitle(`List Objects V2 in "${BUCKET_NAME2}"`)
  const objects = await getObjectsV2(BUCKET_NAME2, '')
  log(objects)

  // Get bucket lifecycle of minio-test
  showTitle(`Get Bucket Lifecycle of "${BUCKET_NAME1}"`)
  lifecycle = await getBucketLifecycle(BUCKET_NAME1)
  if (lifecycle) {
    log(lifecycle)
  }

  // Set bucket lifecycle of minio-test
  showTitle(`Set Bucket Lifecycle of "${BUCKET_NAME1}"`)
  const lifecycleConfig = {
    Rule: [
      {
        ID: 'expire-bucket',
        Status: 'Enabled',
        Expiration: {
          Days: 1,
        },
        Filter: {
          Prefix: '',
        },
      },
    ],
  }
  const result = await setBucketLifecycle(BUCKET_NAME1, lifecycleConfig)
  log('Lifecycle set successfully')

  // Get bucket lifecycle of minio-test
  showTitle(`Get Bucket Lifecycle of "${BUCKET_NAME1}"`)
  lifecycle = await getBucketLifecycle(BUCKET_NAME1)
  if (lifecycle) {
    log(lifecycle)
  }

  // Get download link for minio-test2/folder1/cat.jpeg
  showTitle(
    `Get download link for ${BUCKET_NAME2}/${FOLDER_NAME}/${OBJECT_NAME2}`
  )
  const respHeaders = {
    'response-content-disposition': `attachment; filename="${DOWNLOAD_OBJECT_NAME}"`,
  }
  // if filename is not specified in respHeaders, the original filename in meta data will be used
  const downloadUrl = await getDownloadUrl(
    BUCKET_NAME2,
    `${FOLDER_NAME}/${OBJECT_NAME2}`,
    EXPIRY_60S,
    respHeaders
  )
  console.log(`Download Link: ${downloadUrl}`)
}

main()
