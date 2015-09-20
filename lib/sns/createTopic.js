import { SNS } from 'aws-sdk'
import Promise from 'bluebird'

const createTopic = (credentials, topicName) => {
  const sns = new SNS(credentials)

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
