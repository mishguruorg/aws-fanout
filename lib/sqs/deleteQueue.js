import { SQS } from 'aws-sdk'
import Promise from 'bluebird'

/**
 * Deletes a queue specified by the queue URL
 * @param {Object} credentials
 * @param {String} credentials.region
 * @param {String} credentials.accessKeyId
 * @param {String} credentials.secretAccessKey
 * @param {String} queueUrl - URL of the queue to delete
 * @returns {Promise<{ResponseMetadata: Object}>} de-serialized data returned from the request
 */

const deleteQueue = (credentials, queueUrl) => {
  const sqs = new SQS(credentials)

  return new Promise((resolve, reject) => {
    sqs.deleteQueue({ QueueUrl: queueUrl }, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

export default deleteQueue
