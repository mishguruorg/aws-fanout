import buildQueuePolicy from './utils/buildQueuePolicy'
import buildQueueRedrivePolicy from './utils/buildQueueRedrivePolicy'
import parseQueuePolicy from './utils/parseQueuePolicy'
import uniqueConcat from './utils/uniqueConcat'

import * as sdk from './sdk'

import { Credentials } from './sdk/types'

interface CreateTopicOptions {
  topicName: string,
}

const createTopic = (credentials: Credentials, options: CreateTopicOptions) => {
  const { topicName } = options
  const { sns } = sdk.withCredentials(credentials)
  return sdk.createTopic(sns, topicName)
}

interface CreateQueueOptions {
  queueName: string,
}

const createQueue = (credentials: Credentials, options: CreateQueueOptions) => {
  const { queueName } = options
  const { sqs } = sdk.withCredentials(credentials)
  return sdk.createQueue(sqs, queueName)
}

interface DeleteTopicOptions {
  topicName: string,
}

const deleteTopic = async (
  credentials: Credentials,
  options: DeleteTopicOptions,
) => {
  const { topicName } = options
  const { sns } = sdk.withCredentials(credentials)
  const topicArn = await sdk.createTopic(sns, topicName)
  await sdk.deleteTopic(sns, topicArn)
}

interface DeleteQueueOptions {
  queueName: string,
}

const deleteQueue = async (
  credentials: Credentials,
  options: DeleteQueueOptions,
) => {
  const { queueName } = options
  const { sqs } = sdk.withCredentials(credentials)
  const queueUrl = await sdk.createQueue(sqs, queueName)
  await sdk.deleteQueue(sqs, queueUrl)
}

interface DeleteMessageOptions {
  queueName: string,
  receiptHandle: string,
}

const deleteMessage = async (
  credentials: Credentials,
  options: DeleteMessageOptions,
) => {
  const { queueName, receiptHandle } = options
  const { sqs } = sdk.withCredentials(credentials)
  const queueUrl = await sdk.createQueue(sqs, queueName)
  await sdk.deleteMessage(sqs, queueUrl, receiptHandle)
}

interface ReceiveMessageOptions {
  maxNumberOfMessages: number,
  visibilityTimeout: number,
  queueName: string,
}

const receiveMessage = async (
  credentials: Credentials,
  options: ReceiveMessageOptions,
) => {
  const { queueName, visibilityTimeout, maxNumberOfMessages } = options
  const { sqs } = sdk.withCredentials(credentials)
  const queueUrl = await sdk.createQueue(sqs, queueName)
  return sdk.receiveMessage(sqs, {
    queueUrl,
    maxNumberOfMessages,
    visibilityTimeout,
  })
}

interface PublishMessageOptions {
  topicName: string,
  message: string,
}

const publishMessage = async (
  credentials: Credentials,
  options: PublishMessageOptions,
) => {
  const { topicName, message } = options
  const { sns } = sdk.withCredentials(credentials)
  const topicArn = await sdk.createTopic(sns, topicName)
  return sdk.publish(sns, topicArn, message)
}

interface SetQueuePolicyOptions {
  queueName: string,
  topicNames: string[],
  ignoreExistingPolicy: boolean,
}

const setQueuePolicy = async (
  credentials: Credentials,
  options: SetQueuePolicyOptions,
) => {
  const { queueName, topicNames, ignoreExistingPolicy } = options
  const { sns, sqs } = sdk.withCredentials(credentials)

  const queueUrl = await sdk.createQueue(sqs, queueName)
  const { queueArn, queuePolicy } = await sdk.getQueueAttributes(sqs, queueUrl)

  let topicArnList = await Promise.all(
    topicNames.map(async (topicName) => {
      if (topicName.includes('*')) {
        const arnId = queueArn.match(/^arn:aws:sqs:([^:]*:[^:]*):/)[1]
        const topicArnPattern = `arn:aws:sns:${arnId}:${topicName}`
        return topicArnPattern
      }

      const topicArn = await sdk.createTopic(sns, topicName)
      return topicArn
    }),
  )

  if (ignoreExistingPolicy !== true) {
    const existingTopicArns = parseQueuePolicy(queuePolicy)
    topicArnList = uniqueConcat(existingTopicArns, topicArnList)
  }

  await sdk.setQueueAttributes(sqs, queueUrl, {
    Policy: buildQueuePolicy({
      queueArn,
      topicArnList,
    }),
  })
}

interface SetQueuePolicyWithPatternOptions {
  queueName: string,
  topicNamePattern: string,
}

interface SetQueueRedrivePolicyOptions {
  queueName: string,
  deadLetterQueueName: string,
  maxReceiveCount: number,
}

const setQueueRedrivePolicy = async (
  credentials: Credentials,
  options: SetQueueRedrivePolicyOptions,
) => {
  const { queueName, deadLetterQueueName, maxReceiveCount } = options
  const { sqs } = sdk.withCredentials(credentials)
  const queueUrl = await sdk.createQueue(sqs, queueName)
  const deadLetterQueueUrl = await sdk.createQueue(sqs, deadLetterQueueName)
  const { queueArn: deadLetterTargetArn } = await sdk.getQueueAttributes(
    sqs,
    deadLetterQueueUrl,
  )

  await sdk.setQueueAttributes(sqs, queueUrl, {
    RedrivePolicy: buildQueueRedrivePolicy({
      maxReceiveCount,
      deadLetterTargetArn,
    }),
  })
}

interface SubscribeQueueToTopicOptions {
  queueName: string,
  topicName: string,
}

const subscribeQueueToTopic = async (
  credentials: Credentials,
  options: SubscribeQueueToTopicOptions,
) => {
  const { queueName, topicName } = options
  const { sqs, sns } = sdk.withCredentials(credentials)
  const queueUrl = await sdk.createQueue(sqs, queueName)
  const { queueArn } = await sdk.getQueueAttributes(sqs, queueUrl)
  const topicArn = await sdk.createTopic(sns, topicName)
  await sdk.subscribeQueueToTopic(sns, { topicArn, queueArn })
}

export {
  Credentials,
  createQueue,
  createTopic,
  deleteMessage,
  deleteQueue,
  deleteTopic,
  publishMessage,
  receiveMessage,
  setQueuePolicy,
  setQueueRedrivePolicy,
  subscribeQueueToTopic,
}
