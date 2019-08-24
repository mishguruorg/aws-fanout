import { test, credentials } from './utils/test'
import { arn } from './utils/mockAws'

test('deleteTopic', async (t) => {
  const { eventLog, fanout } = t.context

  const topicName = t.title

  await fanout.deleteTopic(credentials, topicName)

  t.deepEqual(eventLog, [
    ['sns.createTopic', { Name: topicName }],
    ['sns.deleteTopic', { TopicArn: arn.sns(topicName) }],
  ])
})
