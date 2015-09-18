import { SQS } from 'aws-sdk'
import Promise from 'bluebird'

const createQueue = (region, accessKeyId, secretAccessKey, queueName) => {
  const sqs = new SQS({
    region,
    accessKeyId,
    secretAccessKey
  })

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
