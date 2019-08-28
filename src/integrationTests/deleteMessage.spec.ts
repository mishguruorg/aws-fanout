import { test, credentials } from './utils/test'
import { url } from './utils/mockAws'

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
