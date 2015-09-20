import { SNS } from 'aws-sdk'
import Promise from 'bluebird'
import getSnsArn from './getSnsArn'
import { getSqsUrl, getSqsArn } from '../sqs/getQueueInfo'

const createSubscription = (credentials, topicName, queueName) => {
  let scope = {}

  return getSnsArn(credentials, topicName)
    .then(arn => {
      scope.topicArn = arn
      return getSqsArn(credentials, queueName)
    })
    .then(arn => {
      return makeCreateSubscriptionCall(credentials, scope.topicArn, arn)
    })
}

const makeCreateSubscriptionCall = (credentials, topicArn, queueArn) => {
  return new Promise((resolve, reject) => {
    const sns = new SNS(credentials)

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

export default createSubscription
