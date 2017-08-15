import { SQS } from 'aws-sdk'
import Promise from 'bluebird'
import getSnsArn from '../sns/getSnsArn'
import { getAllSqsInfo } from './getQueueInfo'
import getQueueAttributes from './getQueueAttributes'
import { compose, map, union, find, propEq } from 'ramda'

const SQSACTION = 'SQS:SendMessage'
const MAXREDRIVERETRIES = 5

/**
 * Sets the permissions for a queue so that a specified SNS topic can write to it
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {[String]} topicName
 * @param  {String} queueName
 * @param {String} deadLetterQueueName the name for the dead letter queue
 * @return {Promise<{ResponseMetadata: Object}>}
 */
const setQueuePermissions = (credentials, topicNames, queueName, deadLetterQueueName, retries) => {
  if (!Array.isArray(topicNames)) throw new Error('Topic Names must be an array')

  let scope = {}

  return getMultipleSnsArns(credentials, topicNames)
    .then((arns) => {
      scope.topicArns = arns
      return getAllSqsInfo(credentials, queueName)
    })
    .then((info) => {
      scope.queueInfo = info
      return getQueueAttributes(credentials, scope.queueInfo.url)
    })
    .then((queueAttributesRes) => {
      const arnList = queueAttributesRes.Attributes.Policy
        ? getArnListFromPolicy(JSON.parse(queueAttributesRes.Attributes.Policy), scope.topicArns)
        : scope.topicArns
      return createAttributes(arnList, scope.queueInfo.url, scope.queueInfo.arn)
    })
    .then((attributes) => {
      scope.attributes = attributes
      return deadLetterQueueName ? getAllSqsInfo(credentials, deadLetterQueueName) : Promise.resolve()
    })
    .then((deadLetterInfo) => {
      let redrivePolicy
      if (deadLetterInfo) {
        redrivePolicy = getRedrivePolicy(retries || MAXREDRIVERETRIES, deadLetterInfo.arn)
      }
      return setQueueAttributes(credentials, scope.queueInfo.url, scope.attributes, redrivePolicy)
    })
}

const getMultipleSnsArns = (credentials, topicNames) => {
  if (topicNames.length === 1) {
    return Promise.all([getSnsArn(credentials, topicNames[0])])
  } else {
    return compose(
      Promise.all,
      map((topic) => getSnsArn(credentials, topic))
    )(topicNames)
  }
}

const getArnListFromPolicy = (policy, newArns) => {
  const statement = find(propEq('Action', SQSACTION))(policy.Statement)
  if (statement && statement.Condition && statement.Condition.ArnEquals) {
    let sourceArns = statement.Condition.ArnEquals['aws:SourceArn']
    if (sourceArns) {
      if (!Array.isArray(sourceArns)) {
        sourceArns = [sourceArns]
      }

      return union(newArns, sourceArns)
    }
  }

  return newArns
}

const createAttributes = (topicArns, queueUrl, queueArn) => ({
  Version: '2012-10-17',
  Id: `${queueArn}/SQSDefaultPolicy`,
  Statement: [{
    Sid: `Sid${new Date().getTime()}`,
    Effect: 'Allow',
    Principal: '*',
    Action: SQSACTION,
    Resource: queueArn,
    Condition: {
      ArnEquals: {
        'aws:SourceArn': topicArns.length === 1 ? topicArns[0] : topicArns
      }
    }
  }]
})

const getRedrivePolicy = (retries, deadLetterTargetArn) => {
  return {
    maxReceiveCount: retries,
    deadLetterTargetArn
  }
}

const setQueueAttributes = (credentials, queueUrl, attributes, redrivePolicy) => {
  const awsParams = {
    QueueUrl: queueUrl,
    Attributes: {
      Policy: JSON.stringify(attributes)
    }
  }

  if (redrivePolicy) {
    awsParams.Attributes.RedrivePolicy = JSON.stringify(redrivePolicy)
  }

  return new Promise((resolve, reject) => {
    const sqs = new SQS(credentials)
    sqs.setQueueAttributes(awsParams, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default setQueuePermissions
