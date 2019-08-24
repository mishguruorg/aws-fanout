import anyTest, { TestInterface } from 'ava'
import * as stu from 'stu'
import tk from 'timekeeper'

import { mockAws, arn, url } from './mockAws'
import { Credentials } from '../index'

tk.freeze(new Date(1234567890123))

const test = anyTest as TestInterface<{
  eventLog: [string, any][],
  fanout: {
    deleteTopic: (c: Credentials, t: string) => Promise<void>,
    deleteQueue: (c: Credentials, q: string) => Promise<void>,
    deleteMessage: (c: Credentials, q: string, r: string) => Promise<void>,
    receiveMessage: (
      c: Credentials,
      n: number,
      v: number,
      q: string,
    ) => Promise<void>,
    registerTopics: (c: Credentials, t: string[]) => Promise<void>,
    registerQueues: (c: Credentials, q: string[]) => Promise<void>,
    subscribeQueueToTopics: (
      c: Credentials,
      t: string[],
      q: string,
    ) => Promise<void>,
    subscribeQueueTopicsByTheirPrefix: (
      c: Credentials,
      t: string[],
      q: string,
    ) => Promise<void>,
    publish: (
      c: Credentials,
      t: string,
      m: Record<string, any>,
    ) => Promise<Record<string, string>>,
  },
}>

test.beforeEach((t) => {
  const { eventLog } = stu.mock('aws-sdk', mockAws)
  const fanout = stu.test('../index')

  t.context = {
    eventLog,
    fanout,
  }
})

const credentials = {
  region: 'REGION',
  accessKeyId: 'ACCESS_KEY_ID',
  secretAccessKey: 'SECRET_ACCESS_KEY',
}

test('deleteTopic', async (t) => {
  const { eventLog, fanout } = t.context

  const topicName = t.title

  await fanout.deleteTopic(credentials, topicName)

  t.deepEqual(eventLog, [
    ['sns.createTopic', { Name: topicName }],
    ['sns.deleteTopic', { TopicArn: arn.sns(topicName) }],
  ])
})

test('deleteQueue', async (t) => {
  const { eventLog, fanout } = t.context

  const queueName = t.title

  await fanout.deleteQueue(credentials, queueName)

  t.deepEqual(eventLog, [
    ['sqs.createQueue', { QueueName: queueName }],
    ['sqs.deleteQueue', { QueueUrl: url(queueName) }],
  ])
})

test('deleteMessage', async (t) => {
  const { eventLog, fanout } = t.context

  const queueName = t.title
  const receiptHandle = 'receiptHandle'

  await fanout.deleteMessage(credentials, queueName, receiptHandle)

  t.deepEqual(eventLog, [
    ['sqs.createQueue', { QueueName: queueName }],
    [
      'sqs.deleteMessage',
      { QueueUrl: url(queueName), ReceiptHandle: receiptHandle },
    ],
  ])
})

test('receiveMessage', async (t) => {
  const { eventLog, fanout } = t.context

  const maxNumberOfMessages = 10
  const visibilityTimeout = 5
  const queueName = t.title

  await fanout.receiveMessage(
    credentials,
    maxNumberOfMessages,
    visibilityTimeout,
    queueName,
  )

  t.deepEqual(eventLog, [
    ['sqs.createQueue', { QueueName: queueName }],
    [
      'sqs.receiveMessage',
      {
        QueueUrl: url(queueName),
        MaxNumberOfMessages: maxNumberOfMessages,
        MessageAttributeNames: ['All'],
        VisibilityTimeout: visibilityTimeout,
        WaitTimeSeconds: 10,
      },
    ],
  ])
})

test('registerTopics', async (t) => {
  const { eventLog, fanout } = t.context

  const topicNames = [t.title + '-a', t.title + '-b', t.title + '-c']

  await fanout.registerTopics(credentials, topicNames)

  t.deepEqual(eventLog, [
    ['sns.createTopic', { Name: topicNames[0] }],
    ['sns.createTopic', { Name: topicNames[1] }],
    ['sns.createTopic', { Name: topicNames[2] }],
  ])
})

test('registerQueues', async (t) => {
  const { eventLog, fanout } = t.context

  const queueNames = [t.title + '-a', t.title + '-b', t.title + '-c']

  await fanout.registerQueues(credentials, queueNames)

  t.deepEqual(eventLog, [
    ['sqs.createQueue', { QueueName: queueNames[0] }],
    ['sqs.createQueue', { QueueName: queueNames[1] }],
    ['sqs.createQueue', { QueueName: queueNames[2] }],
  ])
})

test('subscribeQueueToTopics', async (t) => {
  const { eventLog, fanout } = t.context

  const queueName = t.title
  const topicNames = [t.title + '-a', t.title + '-b', t.title + '-c']

  await fanout.subscribeQueueToTopics(credentials, topicNames, queueName)

  t.deepEqual(eventLog, [
    ['sqs.createQueue', { QueueName: queueName }],
    [
      'sqs.getQueueAttributes',
      { QueueUrl: url(queueName), AttributeNames: ['QueueArn', 'Policy'] },
    ],
    ['sns.createTopic', { Name: topicNames[0] }],
    ['sns.createTopic', { Name: topicNames[1] }],
    ['sns.createTopic', { Name: topicNames[2] }],
    [
      'sqs.setQueueAttributes',
      {
        QueueUrl: url(queueName),
        Attributes: {
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Id: `${arn.sqs(queueName)}/SQSDefaultPolicy`,
            Statement: [
              {
                Sid: 'Sid1234567890123',
                Effect: 'Allow',
                Principal: '*',
                Action: 'SQS:SendMessage',
                Resource: arn.sqs(queueName),
                Condition: {
                  ArnEquals: {
                    'aws:SourceArn': topicNames.map(arn.sns),
                  },
                },
              },
            ],
          }),
        },
      },
    ],
    [
      'sns.subscribe',
      {
        Protocol: 'sqs',
        TopicArn: arn.sns(topicNames[0]),
        Endpoint: arn.sqs(queueName),
      },
    ],
    [
      'sns.subscribe',
      {
        Protocol: 'sqs',
        TopicArn: arn.sns(topicNames[1]),
        Endpoint: arn.sqs(queueName),
      },
    ],
    [
      'sns.subscribe',
      {
        Protocol: 'sqs',
        TopicArn: arn.sns(topicNames[2]),
        Endpoint: arn.sqs(queueName),
      },
    ],
  ])
})

test('subscribeQueueTopicsByTheirPrefix', async (t) => {
  const { eventLog, fanout } = t.context

  const queueName = t.title
  const topicNames = [t.title + '-a', t.title + '-b', t.title + '-c']
  const topicPrefix = arn.sns(t.title + '-*')

  await fanout.subscribeQueueTopicsByTheirPrefix(
    credentials,
    topicNames,
    queueName,
  )

  t.deepEqual(eventLog, [
    ['sqs.createQueue', { QueueName: queueName }],
    [
      'sqs.getQueueAttributes',
      { QueueUrl: url(queueName), AttributeNames: ['QueueArn'] },
    ],
    [
      'sqs.setQueueAttributes',
      {
        QueueUrl: url(queueName),
        Attributes: {
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Id: `${arn.sqs(queueName)}/SQSDefaultPolicy`,
            Statement: [
              {
                Sid: 'Sid1234567890123',
                Effect: 'Allow',
                Principal: '*',
                Action: 'SQS:SendMessage',
                Resource: arn.sqs(queueName),
                Condition: {
                  ArnEquals: {
                    'aws:SourceArn': topicPrefix,
                  },
                },
              },
            ],
          }),
        },
      },
    ],
    ['sns.createTopic', { Name: topicNames[0] }],
    ['sns.createTopic', { Name: topicNames[1] }],
    ['sns.createTopic', { Name: topicNames[2] }],
    [
      'sns.subscribe',
      {
        Protocol: 'sqs',
        TopicArn: arn.sns(topicNames[0]),
        Endpoint: arn.sqs(queueName),
      },
    ],
    [
      'sns.subscribe',
      {
        Protocol: 'sqs',
        TopicArn: arn.sns(topicNames[1]),
        Endpoint: arn.sqs(queueName),
      },
    ],
    [
      'sns.subscribe',
      {
        Protocol: 'sqs',
        TopicArn: arn.sns(topicNames[2]),
        Endpoint: arn.sqs(queueName),
      },
    ],
  ])
})

test('publish', async (t) => {
  const { eventLog, fanout } = t.context

  const topicName = t.title
  const message = {
    hello: 'world',
  }

  const result = await fanout.publish(credentials, topicName, message)

  t.deepEqual(result, {
    MessageId: 'MessageId',
  })

  t.deepEqual(eventLog, [
    ['sns.createTopic', { Name: topicName }],
    [
      'sns.publish',
      {
        TopicArn: arn.sns(topicName),
        MessageStructure: 'json',
        Message: '{"default":"{\\"hello\\":\\"world\\"}"}',
      },
    ],
  ])
})
