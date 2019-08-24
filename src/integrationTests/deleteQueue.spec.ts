import { test, credentials } from './utils/test'
import { url } from './utils/mockAws'

test('deleteQueue', async (t) => {
  const { eventLog, fanout } = t.context

  const queueName = t.title

  await fanout.deleteQueue(credentials, queueName)

  t.deepEqual(eventLog, [
    ['sqs.createQueue', { QueueName: queueName }],
    ['sqs.deleteQueue', { QueueUrl: url(queueName) }],
  ])
})
