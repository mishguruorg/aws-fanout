import Promise from 'bluebird'
import getSnsArn from '../sns/getSnsArn'
import getQueueAttributes from './getQueueAttributes'
import { map, find, isNil, path, pathOr, propEq, union } from 'ramda'

const SQSACTION = 'SQS:SendMessage'

/**
 * Merge a list of the existing topics that can send to a specific queue and merge this with a list of new topics
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {[String]} topicNames List of all new generic topic names. We will find or create their ARN.
 * @param  {{url: String}} queueInfo, provided by sqs/getQueueInfo.js
 * @return {[String]} List of topics identified by their ARN
 */
const buildTopicArnList = async (credentials, topicNames, queueInfo) => {
  if (!Array.isArray(topicNames)) throw new Error('Topic Names must be an array')

  const { url: queueUrl } = queueInfo
  const topicArns = await findArnForTopics(credentials, topicNames)
  const queueAttributes = await getQueueAttributes(credentials, queueUrl)
  const existingPolicyTopics = findExistingTopics(queueAttributes)
  return union(existingPolicyTopics, topicArns)
}

const findExistingTopics = (queueAttributes) => {
  const rawPolicy = path(['Attributes', 'Policy'], queueAttributes)

  if (isNil(rawPolicy)) {
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

export default buildTopicArnList
