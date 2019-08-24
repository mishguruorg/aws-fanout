import { SQS, SNS } from 'aws-sdk'
import commonPrefix from 'common-prefix'
import PProgress from 'p-progress'

import buildQueuePolicy from './buildQueuePolicy'

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

const subscribeQueueToTopics = (
  credentials: Credentials,
  topicNames: string[],
  queueName: string,
  deadLetterQueueName?: string,
  maxReceiveCount: number = 5,
) => {
  return new PProgress(async (resolve, reject, progress) => {
    try {
      let counter = 0
      const counterTotal = 3 + topicNames.length * 2
      const tick = () => {
        counter += 1
        progress(counter / counterTotal)
      }

      const sqs = new SQS(credentials)
      const sns = new SNS(credentials)

      const queueUrl = await sdk.createQueue(sqs, queueName)
      tick()

      const queueAttributes = await sdk.getQueueAttributes(sqs, queueUrl, [
        'QueueArn',
        'Policy',
      ])
      tick()

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
              if (
                item.Condition == null ||
                  item.Condition.ArnEquals == null
              ) {
                return []
              }
              return item.Condition.ArnEquals['aws:SourceArn']
            })
            .flat()

      const topicArns = await Promise.all(
        topicNames.map(async (topicName) => {
          const topicArn = await sdk.createTopic(sns, topicName)
          tick()
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
        attributes.RedrivePolicy = JSON.stringify({
          maxReceiveCount,
          deadLetterTargetArn,
        })
      }

      await sdk.setQueueAttributes(sqs, queueUrl, attributes)
      tick()

      await Promise.all(
        topicArns.map(async (topicArn) => {
          await sdk.subscribeQueueToTopic(sns, {
            topicArn,
            queueArn,
          })
          tick()
        }),
      )
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

const subscribeQueueTopicsByTheirPrefix = (
  credentials: Credentials,
  topicNames: string[],
  queueName: string,
  deadLetterQueueName?: string,
  maxReceiveCount: number = 5,
) => {
  return new PProgress(async (resolve, reject, progress) => {
    try {
      let counter = 0
      const counterTotal = 3 + topicNames.length * 2
      const tick = () => {
        counter += 1
        progress(counter / counterTotal)
      }
      const sqs = new SQS(credentials)
      const sns = new SNS(credentials)

      const topicPrefix = commonPrefix(topicNames)

      const queueUrl = await sdk.createQueue(sqs, queueName)
      tick()

      const queueArn = await sdk.getQueueArnByUrl(sqs, queueUrl)
      tick()

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
        attributes.RedrivePolicy = JSON.stringify({
          maxReceiveCount,
          deadLetterTargetArn,
        })
      }

      await sdk.setQueueAttributes(sqs, queueUrl, attributes)
      tick()

      await Promise.all(
        topicNames.map(async (topicName) => {
          const topicArn = await sdk.createTopic(sns, topicName)
          tick()

          await sdk.subscribeQueueToTopic(sns, { topicArn, queueArn })
          tick()
        }),
      )
      resolve()
    } catch (error) {
      reject(error)
    }
  })
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
