import { SQS } from 'aws-sdk'
import Promise from 'bluebird'

/**
 * delete a message from a queue
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} queueUrl
 * @param  {String} receiptHandle
 * @return {Promise<{ResponseMetadata: Object}>}
 */
const deleteMessage = (credentials, queueUrl, receiptHandle) => {
  const sqs = new SQS(credentials)

  return new Promise((resolve, reject) => {
    sqs.deleteMessage({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default deleteMessage
