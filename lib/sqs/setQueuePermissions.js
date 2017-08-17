import { getAllSqsInfo } from './getQueueInfo'
import setQueueAttributes from './setQueueAttributes'

const SQSACTION = 'SQS:SendMessage'
const MAXREDRIVERETRIES = 5

/**
 * Sets the permissions for a queue so that SNS topics can write to it
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {[String]} arnTopics A list of topic names, identified by their ARN
 * @param  {{url: String, arn: String}} queueInfo
 * @param {String} deadLetterQueueName the name for the dead letter queue
 * @return {Promise<{ResponseMetadata: Object}>}
 */
const setQueuePermissions = async (credentials, arnTopics, queueInfo, deadLetterQueueName, retries) => {
  if (!Array.isArray(arnTopics)) throw new Error('Topic Names must be an array')

  const { url: queueUrl, arn: queueArn } = queueInfo
  const attributes = buildPolicy(arnTopics, queueUrl, queueArn)

  if (deadLetterQueueName) {
    const deadLetterInfo = await getAllSqsInfo(credentials, deadLetterQueueName)
    const redrivePolicy = await getRedrivePolicy(retries || MAXREDRIVERETRIES, deadLetterInfo.arn)
    return setQueueAttributes(credentials, queueUrl, attributes, redrivePolicy)
  }

  return setQueueAttributes(credentials, queueUrl, attributes)
}

const buildPolicy = (topicArns, queueUrl, queueArn) => ({
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
