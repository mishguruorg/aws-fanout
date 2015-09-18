import createQueue from './sqs/createQueue'
import getQueueArn from './sqs/getQueueArn'
import Promise from 'bluebird'

let sqsCache = {}

const getSqsUrl = (region, accessKeyId, secretAccessKey, readableName) => {
  let cachedInfo = sqsCache[readableName]
  if (cachedInfo && cachedInfo.url) {
    return Promise.resolve(cachedInfo.url)
  }

  return createQueue(region, accessKeyId, secretAccessKey, readableName)
    .then(res => {
      sqsCache[readableName] = cachedInfo || {}
      sqsCache[readableName].url = res.QueueUrl

      return res.QueueUrl
    })
}

const getSqsArn = (region, accessKeyId, secretAccessKey, readableName) => {
  return getSqsUrl(region, accessKeyId, secretAccessKey, readableName)
    .then(url => getQueueArn(region, accessKeyId, secretAccessKey, url)
    .then(res => {
      const arn = res.attribute.value

      sqsCache[readableName] = cachedInfo[readableName] || {}
      sqsCache[readableName].arn = arn

      return arn
    })
}

export {
  getSqsArn,
  getSqsUrl
}
