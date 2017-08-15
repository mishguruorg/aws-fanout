import createTopic from '../sns/createTopic'
import { memoize } from 'ramda'

/**
 * Gets an SNS Arn
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} topicName
 * @return {Promise<String>} The Arn
 */
const getSnsArn = memoize((credentials, readableName) => (
  createTopic(credentials, readableName)
    .then((res) => res.TopicArn)
))

export default getSnsArn
