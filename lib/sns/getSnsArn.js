import createTopic from '../sns/createTopic'
import Promise from 'bluebird'

let snsCache = {}

/**
 * Gets an SNS Arn
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} topicName
 * @return {Promise<String>} The Arn
 */
const getSnsArn = (credentials, readableName) => {
  const cachedArn = snsCache[readableName]
  if (cachedArn) {
    return Promise.resolve(cachedArn)
  }

  return createTopic(credentials, readableName)
    .then(res => {
      snsCache[readableName] = res.TopicArn

      return res.TopicArn
    })
}

export default getSnsArn
