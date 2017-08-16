import { SNS } from 'aws-sdk'
import Promise from 'bluebird'

/**
 * Creates a topic on SNS
 * This action is idempotent, so if the requester already owns a topic with the specified name,
 * that topic's ARN is returned without creating a new topic.
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials [description]
 * @param  {String} topicName   [description]
 * @return {Promise<{ResponseMetadata: Object, TopicArn: String}>}             [description]
 */
const createTopic = (credentials, topicName) => {
  const sns = new SNS(credentials)

  return new Promise((resolve, reject) => {
    sns.createTopic({
      Name: topicName
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default createTopic
