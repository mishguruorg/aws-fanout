import { SNS } from 'aws-sdk'
import Promise from 'bluebird'
import getSnsArn from './getSnsArn'
import { getSqsArn } from '../sqs/getQueueInfo'

const subscribe = (credentials, queueName, topicName) => {
  let scope = {}

  return getSnsArn(credentials, topicName)
    .then((arn) => {
      scope.topicArn = arn
      return getSqsArn(credentials, queueName)
    })
    .then((arn) => {
      scope.queueArn = arn
      return subscribeQueueToTopic(credentials, scope.topicArn, scope.queueArn)
    })
}

const subscribeQueueToTopic = (credentials, topicArn, queueArn) => {
  const sns = new SNS(credentials)

  return new Promise((resolve, reject) => {
    sns.subscribe({
      TopicArn: topicArn,
      Protocol: 'sqs',
      Endpoint: queueArn
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default subscribe
