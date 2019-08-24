import { SQS, SNS } from 'aws-sdk'
import commonPrefix from 'common-prefix'

import buildQueuePolicy from './buildQueuePolicy'
import buildQueueRedrivePolicy from './buildQueueRedrivePolicy'

import * as sdk from './sdk'

export type Credentials = SQS.Types.ClientConfiguration &
SNS.Types.ClientConfiguration

const deleteTopic = async (credentials: Credentials, topicName: string) => {
  const sns = new SNS(credentials)
  const topicArn = await sdk.createTopic(sns, topicName)
  await sdk.deleteTopic(sns, topicArn)
}

const deleteQueue = async (credentials: Credentials, queueName: string) => {
  const sqs = new SQS(credentials)
  const queueUrl = await sdk.createQueue(sqs, queueName)
  await sdk.deleteQueue(sqs, queueUrl)
}

const deleteMessage = async (
  credentials: Credentials,
  queueName: string,
  receiptHandle: string,
) => {
  const sqs = new SQS(credentials)
  const queueUrl = await sdk.createQueue(sqs, queueName)
  await sdk.deleteMessage(sqs, queueUrl, receiptHandle)
}

const registerTopics = (credentials: Credentials, topicNames: string[]) => {
  const sns = new SNS(credentials)
  return Promise.all(
    topicNames.map((topicName) => sdk.createTopic(sns, topicName)),
  )
}

const registerQueues = (credentials: Credentials, queueNames: string[]) => {
  const sqs = new SQS(credentials)
  return Promise.all(
    queueNames.map((queueName) => sdk.createQueue(sqs, queueName)),
  )
}

const receiveMessage = async (
  credentials: Credentials,
  maxNumberOfMessages: number,
  visibilityTimeout: number,
  queueName: string,
) => {
  const sqs = new SQS(credentials)
  const queueUrl = await sdk.createQueue(sqs, queueName)
  return sdk.receiveMessage(sqs, {
    queueUrl,
    maxNumberOfMessages,
    visibilityTimeout,
  })
}

const subscribeQueueToTopics = async (
  credentials: Credentials,
  topicNames: string[],
  queueName: string,
  deadLetterQueueName?: string,
  maxReceiveCount: number = 5,
) => {
  const sqs = new SQS(credentials)
  const sns = new SNS(credentials)

  const queueUrl = await sdk.createQueue(sqs, queueName)

  const queueAttributes = await sdk.getQueueAttributes(sqs, queueUrl, [
    'QueueArn',
    'Policy',
  ])

  const queueArn = queueAttributes.QueueArn
  const queuePolicy = queueAttributes.Policy

  const existingTopicArns =
    queuePolicy == null
      ? []
      : JSON.parse(queuePolicy)
        .Statement.filter((item: any) => {
          return item.Action === 'SQS:SendMessage'
        })
        .map((item: any) => {
          if (item.Condition == null || item.Condition.ArnEquals == null) {
            return []
          }
          return item.Condition.ArnEquals['aws:SourceArn']
        })
        .flat()

  const topicArns = await Promise.all(
    topicNames.map(async (topicName) => {
      const topicArn = await sdk.createTopic(sns, topicName)
      return topicArn
    }),
  )

  const allTopicArns = [...new Set([...existingTopicArns, ...topicArns])]

  const attributes: SQS.Types.QueueAttributeMap = {
    Policy: buildQueuePolicy({
      queueArn,
      topicArnList: allTopicArns,
    }),
  }

  if (deadLetterQueueName != null) {
    const deadLetterTargetArn = await sdk.getQueueArnByName(
      sqs,
      deadLetterQueueName,
    )
    attributes.RedrivePolicy = buildQueueRedrivePolicy({
      maxReceiveCount,
      deadLetterTargetArn,
    })
  }

  await sdk.setQueueAttributes(sqs, queueUrl, attributes)

  await Promise.all(
    topicArns.map(async (topicArn) => {
      await sdk.subscribeQueueToTopic(sns, {
        topicArn,
        queueArn,
      })
    }),
  )
}

const subscribeQueueTopicsByTheirPrefix = async (
  credentials: Credentials,
  topicNames: string[],
  queueName: string,
  deadLetterQueueName?: string,
  maxReceiveCount: number = 5,
) => {
  const sqs = new SQS(credentials)
  const sns = new SNS(credentials)

  const queueUrl = await sdk.createQueue(sqs, queueName)
  const queueArn = await sdk.getQueueArnByUrl(sqs, queueUrl)

  const topicPrefix = commonPrefix(topicNames)
  const arnId = queueArn.match(/^arn:aws:sqs:([^:]*:[^:]*):/)[1]
  const topicArnPrefix = `arn:aws:sns:${arnId}:${topicPrefix}*`

  const attributes: SQS.Types.QueueAttributeMap = {
    Policy: buildQueuePolicy({
      queueArn,
      topicArnList: [topicArnPrefix],
    }),
  }

  if (deadLetterQueueName != null) {
    const deadLetterTargetArn = await sdk.getQueueArnByName(
      sqs,
      deadLetterQueueName,
    )
    attributes.RedrivePolicy = buildQueueRedrivePolicy({
      maxReceiveCount,
      deadLetterTargetArn,
    })
  }

  await sdk.setQueueAttributes(sqs, queueUrl, attributes)

  await Promise.all(
    topicNames.map(async (topicName) => {
      const topicArn = await sdk.createTopic(sns, topicName)
      await sdk.subscribeQueueToTopic(sns, { topicArn, queueArn })
    }),
  )
}

const publish = async (
  credentials: Credentials,
  topicName: string,
  message: Record<string, any>,
) => {
  const sns = new SNS(credentials)
  const topicArn = await sdk.createTopic(sns, topicName)
  return sdk.publish(sns, topicArn, JSON.stringify(message))
}

export {
  deleteTopic,
  deleteQueue,
  deleteMessage,
  receiveMessage,
  registerTopics,
  registerQueues,
  subscribeQueueToTopics,
  subscribeQueueTopicsByTheirPrefix,
  publish,
}
