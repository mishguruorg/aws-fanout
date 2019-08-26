import commonPrefix from 'common-prefix'

import * as v2 from './v2'

import { Credentials } from './sdk/types'

const deleteTopic = async (credentials: Credentials, topicName: string) => {
  return v2.deleteTopic(credentials, { topicName })
}

const deleteQueue = async (credentials: Credentials, queueName: string) => {
  return v2.deleteQueue(credentials, { queueName })
}

const deleteMessage = async (
  credentials: Credentials,
  queueName: string,
  receiptHandle: string,
) => {
  return v2.deleteMessage(credentials, { queueName, receiptHandle })
}

const registerTopics = (credentials: Credentials, topicNames: string[]) => {
  return Promise.all(
    topicNames.map((topicName) => v2.createTopic(credentials, { topicName })),
  )
}

const registerQueues = (credentials: Credentials, queueNames: string[]) => {
  return Promise.all(
    queueNames.map((queueName) => v2.createQueue(credentials, { queueName })),
  )
}

const receiveMessage = async (
  credentials: Credentials,
  maxNumberOfMessages: number,
  visibilityTimeout: number,
  queueName: string,
) => {
  return v2.receiveMessage(credentials, {
    maxNumberOfMessages,
    visibilityTimeout,
    queueName,
  })
}

const subscribeQueueToTopics = async (
  credentials: Credentials,
  topicNames: string[],
  queueName: string,
  deadLetterQueueName?: string,
  maxReceiveCount: number = 5,
) => {
  await v2.setQueuePolicy(credentials, {
    queueName,
    topicNames,
    ignoreExistingPolicy: false,
  })

  if (deadLetterQueueName != null) {
    await v2.setQueueRedrivePolicy(credentials, {
      queueName,
      deadLetterQueueName,
      maxReceiveCount,
    })
  }

  await Promise.all(
    topicNames.map((topicName) =>
      v2.subscribeQueueToTopic(credentials, { topicName, queueName }),
    ),
  )
}

const subscribeQueueTopicsByTheirPrefix = async (
  credentials: Credentials,
  topicNames: string[],
  queueName: string,
  deadLetterQueueName?: string,
  maxReceiveCount: number = 5,
) => {
  const topicNamePattern = commonPrefix(topicNames) + '*'

  await v2.setQueuePolicy(credentials, {
    queueName,
    topicNames: [topicNamePattern],
    ignoreExistingPolicy: false,
  })

  if (deadLetterQueueName != null) {
    await v2.setQueueRedrivePolicy(credentials, {
      queueName,
      deadLetterQueueName,
      maxReceiveCount,
    })
  }

  await Promise.all(
    topicNames.map((topicName) =>
      v2.subscribeQueueToTopic(credentials, { topicName, queueName }),
    ),
  )
}

const publish = async (
  credentials: Credentials,
  topicName: string,
  message: Record<string, any>,
) => {
  return v2.publishMessage(credentials, {
    topicName,
    message: JSON.stringify(message),
  })
}

export {
  Credentials,
  deleteMessage,
  deleteQueue,
  deleteTopic,
  publish,
  receiveMessage,
  registerQueues,
  registerTopics,
  subscribeQueueToTopics,
  subscribeQueueTopicsByTheirPrefix,
}
