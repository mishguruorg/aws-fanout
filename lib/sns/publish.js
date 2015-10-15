import { SNS } from 'aws-sdk'
import Promise from 'bluebird'
import getSnsArn from './getSnsArn'

/**
 * Allows these topics to write to a specified queue
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials [description]
 * @param  {String} readableName      [Name of the topic]
 * @param  {Object} messageJson       [Json that will be set to the default parameter of message]
 * @return {Promise<{ResponseMetadata: Object, MessageId: String}>}             [response]
 */
const publish = (credentials, readableName, messageJson) => {
  return getSnsArn(credentials, readableName)
    .then(arn => publishToSns(credentials, arn, messageJson))
}

const publishToSns = (credentials, topicArn, messageJson) => {
  const sns = new SNS(credentials)

  return new Promise((resolve, reject) => {
    sns.publish({
      TopicArn: topicArn,
      MessageStructure: 'json',
      Message: JSON.stringify({
        default: JSON.stringify(messageJson)
      })
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default publish
