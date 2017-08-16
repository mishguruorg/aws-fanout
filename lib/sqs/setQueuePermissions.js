import Promise from 'bluebird'
import getSnsArn from '../sns/getSnsArn'
import { getAllSqsInfo } from './getQueueInfo'
import getQueueAttributes from './getQueueAttributes'
import setQueueAttributes from './setQueueAttributes'
import { map, find, path, pathOr, propEq, union } from 'ramda'

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
const setQueuePermissions = async (credentials, topicNames, queueName, deadLetterQueueName, retries) => {
  if (!Array.isArray(topicNames)) throw new Error('Topic Names must be an array')

  const topicArns = await findArnForTopics(credentials, topicNames)
  const queueInfo = await getAllSqsInfo(credentials, queueName)
  const queueAttributes = await getQueueAttributes(credentials, queueInfo.url)
  const existingPolicyTopics = findExistingTopics(queueAttributes)
  const arnList = union(existingPolicyTopics, topicArns)

  const attributes = await createAttributes(arnList, queueInfo.url, queueInfo.arn)

  if (deadLetterQueueName) {
    const deadLetterInfo = await getAllSqsInfo(credentials, deadLetterQueueName)
    const redrivePolicy = await getRedrivePolicy(retries || MAXREDRIVERETRIES, deadLetterInfo.arn)
    return setQueueAttributes(credentials, queueInfo.url, attributes, redrivePolicy)
  }

  return setQueueAttributes(credentials, queueInfo.url, attributes)
}

const findExistingTopics = (queueAttributes) => {
  const rawPolicy = path(['Attributes', 'Policy'], queueAttributes)

  if (rawPolicy == null) {
    return []
  }

  const policy = JSON.parse(rawPolicy)

  const statement = find(propEq('Action', SQSACTION))(policy.Statement)
  const sourceArns = pathOr([], ['Condition', 'ArnEquals', 'aws:SourceArn'], statement)

  return Array.isArray(sourceArns) ? sourceArns : [sourceArns]
}

const findArnForTopics = (credentials, topicNames) => {
  const lookupTopicArns = map((topic) => getSnsArn(credentials, topic))
  return Promise.all(lookupTopicArns(topicNames))
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

export default setQueuePermissions
