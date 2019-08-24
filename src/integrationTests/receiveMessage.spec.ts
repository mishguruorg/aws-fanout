import { test, credentials } from './utils/test'
import { url } from './utils/mockAws'

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
