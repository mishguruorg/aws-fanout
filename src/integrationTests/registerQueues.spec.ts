import { test, credentials } from './utils/test'

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
