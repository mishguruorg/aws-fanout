import { SQS } from 'aws-sdk'
import Promise from 'bluebird'

/**
 * Gets the ARN for a queue
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} queueUrl
 * @return {Promise<{ResponseMetadata: Object, Attribute: {Name: String, Value: String}}>}
 */
const getQueueAttributes = (credentials, queueUrl) => {
  const sqs = new SQS(credentials)

  return new Promise((resolve, reject) => {
    sqs.getQueueAttributes({
      QueueUrl: queueUrl,
      AttributeNames: ['All']
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default getQueueAttributes
