import { SQS } from 'aws-sdk'
import Promise from 'bluebird'

/**
 * Receive a message from the queue
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {Number} maxMessages
 * @param  {String} queueUrl
 * @return {Promise<{ResponseMetadata: Object}>}
 */
const receiveMessage = (credentials, maxMessages, visibilityTimeout, queueUrl) => {
  const sqs = new SQS(credentials)

  return new Promise((resolve, reject) => {
    sqs.receiveMessage({
      QueueUrl: queueUrl, /* required */
      MaxNumberOfMessages: maxMessages,
      MessageAttributeNames: 'All',
      VisibilityTimeout: visibilityTimeout,
      WaitTimeSeconds: 10
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default receiveMessage
