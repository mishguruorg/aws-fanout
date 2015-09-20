import { SQS } from 'aws-sdk'
import Promise from 'bluebird'

const getQueueArn = (credentials, queueUrl) => {
  const sqs = new SQS(credentials)

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
