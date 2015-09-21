import createQueue from './sqs/createQueue'
import getQueueArn from './sqs/getQueueArn'
import Promise from 'bluebird'

let sqsCache = {}

/**
 * Gets a queue URL
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} queueName
 * @return {Promise<String>}
 */
const getSqsUrl = (credentials, readableName) => {
  let cachedInfo = sqsCache[readableName]
  if (cachedInfo && cachedInfo.url) {
    return Promise.resolve(cachedInfo.url)
  }

  return createQueue(credentials, readableName)
    .then(res => {
      sqsCache[readableName] = cachedInfo || {}
      sqsCache[readableName].url = res.QueueUrl

      return res.QueueUrl
    })
}

/**
 * Gets the ARN for a queue
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} queueName
 * @return {Promise<String>} ARN
 */
const getSqsArn = (credentials, readableName) => {
  return getSqsUrl(credentials, readableName)
    .then(url => getQueueArn(credentials, url))
    .then(res => {
      const arn = res.attribute.value

      sqsCache[readableName] = sqsCache[readableName] || {}
      sqsCache[readableName].arn = arn

      return arn
    })
}

/**
 * Gets the ARN and the URL for a queue
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} queueName
 * @return {Promise<{url: String, arn: String}>}
 */
const getAllSqsInfo = (credentials, readableName) => {
  return getSqsArn(credentials, readableName)
    .then(arn => sqsCache[readableName])
}

export {
  getAllSqsInfo,
  getSqsArn,
  getSqsUrl
}
