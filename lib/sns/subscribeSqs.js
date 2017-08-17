import { SNS } from 'aws-sdk'
import Promise from 'bluebird'
import { map } from 'ramda'
import getSnsArn from './getSnsArn'
import { getSqsArn } from '../sqs/getQueueInfo'

const findTopicAndSubscribe = (credentials, queueName, topicName) => {
  let scope = {}

  return getSnsArn(credentials, topicName)
    .then((arn) => {
      scope.topicArn = arn
      return getSqsArn(credentials, queueName)
    })
    .then((arn) => {
      scope.queueArn = arn
      return subscribeSqs(credentials, scope.topicArn, scope.queueArn)
    })
}

const subscribeSqs = (credentials, topicArn, queueArn) => {
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

const subscribeTopics = (credentials, queueArn, topicArnList) => {
  const subscribeTopic = (topicArn) => subscribeSqs(credentials, queueArn, topicArn)
  const topicsToSubscribe = map(subscribeTopic, topicArnList)
  return Promise.all(topicsToSubscribe)
}

export default findTopicAndSubscribe

export {
  findTopicAndSubscribe,
  subscribeSqs,
  subscribeTopics
}
