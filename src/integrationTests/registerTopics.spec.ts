import { test, credentials } from './utils/test'

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
