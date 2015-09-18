import { SNS } from 'aws-sdk'
import Promise from 'bluebird'

const createTopic = (region, accessKeyId, secretAccessKey, topicName) => {
  const sns = new SNS({
    region,
    accessKeyId,
    secretAccessKey
  })

  return new Promise((resolve, reject) => {
    sns.createTopic({
      Name: topicName
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default createTopic
