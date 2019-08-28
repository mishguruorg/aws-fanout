import { test, credentials } from './utils/test'
import { arn, url } from './utils/mockAws'

import buildQueuePolicy from '../utils/buildQueuePolicy'

test('subscribeQueueTopicsByTheirPrefix', async (t) => {
  const { eventLog, fanout } = t.context

  const queueName = t.title
  const topicNames = [t.title + '-a', t.title + '-b', t.title + '-c']
  const topicArnPattern = arn.sns(t.title + '-*')

  await fanout.subscribeQueueTopicsByTheirPrefix(
    credentials,
    topicNames,
    queueName,
  )

  t.deepEqual(eventLog, [
    ['sqs.createQueue', { QueueName: queueName }],
    [
      'sqs.getQueueAttributes',
      { QueueUrl: url(queueName), AttributeNames: ['QueueArn', 'Policy'] },
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
                    'aws:SourceArn': topicArnPattern,
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

test('with deadLetterQueueName', async (t) => {
  const { eventLog, fanout } = t.context

  const queueName = 'queueWithPrefixAndDeadLetterQueue'
  const topicNames = [t.title]
  const deadLetterQueueName = 'ghoul'
  const maxReceiveCount = 2
  const topicArnPattern = arn.sns(topicNames[0] + '*')

  await fanout.subscribeQueueTopicsByTheirPrefix(
    credentials,
    topicNames,
    queueName,
    deadLetterQueueName,
    maxReceiveCount,
  )

  t.deepEqual(eventLog, [
    ['sqs.createQueue', { QueueName: queueName }],
    [
      'sqs.getQueueAttributes',
      { QueueUrl: url(queueName), AttributeNames: ['QueueArn', 'Policy'] },
    ],
    [
      'sqs.setQueueAttributes',
      {
        QueueUrl: url(queueName),
        Attributes: {
          Policy: buildQueuePolicy({
            queueArn: arn.sqs(queueName),
            topicArnList: [topicArnPattern],
          }),
        },
      },
    ],
    ['sqs.createQueue', { QueueName: deadLetterQueueName }],
    [
      'sqs.getQueueAttributes',
      {
        QueueUrl: url(deadLetterQueueName),
        AttributeNames: ['QueueArn', 'Policy'],
      },
    ],
    [
      'sqs.setQueueAttributes',
      {
        QueueUrl: url(queueName),
        Attributes: {
          RedrivePolicy: JSON.stringify({
            maxReceiveCount,
            deadLetterTargetArn: arn.sqs(deadLetterQueueName),
          }),
        },
      },
    ],
    ['sns.createTopic', { Name: topicNames[0] }],
    [
      'sns.subscribe',
      {
        Protocol: 'sqs',
        TopicArn: arn.sns(topicNames[0]),
        Endpoint: arn.sqs(queueName),
      },
    ],
  ])
})
