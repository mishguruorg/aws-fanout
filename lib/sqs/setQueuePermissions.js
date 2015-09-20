import { SQS } from 'aws-sdk'
import Promise from 'bluebird'
import getSnsArn from '../sns/getSnsArn'
import { getAllSqsInfo } from './getQueueInfo'

const setQueuePermissions = (credentials, topicName, queueName) => {
  let scope = {}

  return getSnsArn(credentials, topicName)
    .then(arn => {
      scope.topicArn = arn
      return getAllSqsInfo(credentials, queueName)
    })
    .then(info => {
      scope.queueInfo = info
      return createAttributes(scope.topicArn, scope.queueInfo.url, scope.queueInfo.arn)
    })
    .then(attributes => {
      return setQueueAttributes(credentials, scope.queueInfo.url, attributes)
    })
}

const createAttributes = (topicArn, queueUrl, queueArn) => ({
  Version: '2008-10-17',
  Id: `${queueArn}/SQSDefaultPolicy`,
  Statemenet: [{
    Sid: `Sid${new Date().getTime()}`,
    Effect: 'Allow',
    Principal: {
      AWS: '*'
    },
    Action: 'SQS:SendMessage',
    Resource: queueArn,
    Condition: {
      ArnEquals: {
        'aws:SourceArn': topicArn
      }
    }
  }]
})

const setQueueAttributes = (credentials, queueUrl, attributes) => {
  return new Promise((resolve, reject) => {
    const sqs = new SQS(credentials)

    sqs.setQueueAttributes({
      queueUrl,
      Attributes: {
        Policy: JSON.stringify(attributes)
      }
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default setQueuePermissions 
