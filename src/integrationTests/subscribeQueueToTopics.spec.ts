import { test, credentials } from './utils/test'
import { arn, url } from './utils/mockAws'

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
