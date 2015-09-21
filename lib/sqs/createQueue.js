import { SQS } from 'aws-sdk'
import Promise from 'bluebird'

/**
 * Creates a Queue on SQS
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} queueName   
 * @return {Promise<{ResponseMetadata: Object, QueueUrl: String}>}
 */
const createQueue = (credentials, queueName) => {
  const sqs = new SQS(credentials)

  return new Promise((resolve, reject) => {
    sqs.createQueue({
      QueueName: queueName
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default createQueue
