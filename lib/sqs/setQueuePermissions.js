import { SQS } from 'aws-sdk'
import Promise from 'bluebird'
import getSnsArn from '../sns/getSnsArn'
import { getAllSqsInfo } from './getQueueInfo'
import { compose, map } from 'ramda'

/**
 * Sets the permissions for a queue so that a specified SNS topic can write to it
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} topicName
 * @param  {String} queueName
 * @return {Promise<{ResponseMetadata: Object}>}
 */
const setQueuePermissions = (credentials, topicNames, queueName) => {
  let scope = {}

  return getMultipleSnsArns(credentials, topicNames)
    .then((...arns) => {
      scope.topicArns = arns
      return getAllSqsInfo(credentials, queueName)
    })
    .then(info => {
      scope.queueInfo = info
      return createAttributes(scope.topicArns, scope.queueInfo.url, scope.queueInfo.arn)
    })
    .then(attributes => {
      return setQueueAttributes(credentials, scope.queueInfo.url, attributes)
    })
}

const getMultipleSnsArns = (credentials, ...topicNames) => {
  if (topicNames.length === 1) {
    return getSnsArn(credentials, topicNames[0])
  } else {
    return compose(
      Promise.all,
      map(topic => getSnsArn(credentials, topic))
    )(topicNames)
  }
}

const createAttributes = (topicArns, queueUrl, queueArn) => ({
  Version: '2012-10-17',
  Id: `${queueArn}/SQSDefaultPolicy`,
  Statement: [{
    Sid: `Sid${new Date().getTime()}`,
    Effect: 'Allow',
    Principal: '*',
    Action: 'SQS:SendMessage',
    Resource: queueArn,
    Condition: {
      ArnEquals: {
        'aws:SourceArn': topicArns.length === 1 ? topicArns[0] : topicArns
      }
    }
  }]
})

const setQueueAttributes = (credentials, queueUrl, attributes) => {
  return new Promise((resolve, reject) => {
    const sqs = new SQS(credentials)
    sqs.setQueueAttributes({
      QueueUrl: queueUrl,
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
