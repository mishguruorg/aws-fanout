import { SQS } from 'aws-sdk'
import Promise from 'bluebird'

const createTopic = (region, accessKeyId, secretAccessKey, topicName) => {
  const sqs = new SQS({
    region,
    accessKeyId,
    secretAccessKey
  })

  return new Promise((resolve, reject) => {
    sqs.createTopic({
      Name: topicName
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default createTopic
