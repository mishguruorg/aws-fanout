import createQueue from './sqs/createQueue'
import getQueueArn from './sqs/getQueueArn'
import Promise from 'bluebird'

let sqsCache = {}

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

const getSqsArn = (credentials, readableName) => {
  return getSqsUrl(credentials, readableName)
    .then(url => getQueueArn(credentials, url)
    .then(res => {
      const arn = res.attribute.value

      sqsCache[readableName] = cachedInfo[readableName] || {}
      sqsCache[readableName].arn = arn

      return arn
    })
}

const getSqsInfo = (credentials, readableName) => {
  return
}

export {
  getSqsArn,
  getSqsUrl
}
