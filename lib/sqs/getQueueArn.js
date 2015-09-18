import { SQS } from 'aws-sdk'
import Promise from 'bluebird'

const getQueueArn = (region, accessKeyId, secretAccessKey, queueUrl) => {
  const sqs = new SQS({
    region,
    accessKeyId,
    secretAccessKey
  })

  return new Promise((resolve, reject) => {
    sqs.getQueueAttributes({
      QueueUrl: queueUrl,
      AttributeNames: ["QueueArn"]
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default getQueueArn
