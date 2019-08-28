import { test, credentials } from './utils/test'
import { arn } from './utils/mockAws'

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
