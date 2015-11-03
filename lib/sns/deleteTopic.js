import { SNS } from 'aws-sdk'
import Promise from 'bluebird'

/**
 * Deletes a topic and all its subscriptions, specified by the ARN
 * @param {Object} credentials
 * @param {String} credentials.region
 * @param {String} credentials.accessKeyId
 * @param {String} credentials.secretAccessKey
 * @param {string} topicArn - ARN of the topic to delete
 * @returns {Promise<{ResponseMetadata: Object}>} de-serialized data returned from the request
 */

const deleteTopic = (credentials, topicArn) => {
  const sns = new SNS(credentials)

  return new Promise((resolve, reject) => {
    sns.deleteTopic({ TopicArn: topicArn }, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

export default deleteTopic
