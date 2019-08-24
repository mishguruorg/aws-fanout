import { SNS } from 'aws-sdk'
import mem from 'mem'

import { schedule, cacheKey } from './utils'

interface SubscribeQueueToTopicOptions {
  queueArn: string,
  topicArn: string,
}

const forceSubscribeQueueToTopic = (
  sns: SNS,
  options: SubscribeQueueToTopicOptions,
) => {
  return schedule(async () => {
    const { topicArn, queueArn } = options
    try {
      await sns
        .subscribe({
          Endpoint: queueArn,
          TopicArn: topicArn,
          Protocol: 'sqs',
        })
        .promise()
    } catch (error) {
      throw new Error(
        `Could not subscribe topic "${topicArn}" to queue ${queueArn}\n${error.message}`,
      )
    }
  })
}

const subscribeQueueToTopic = mem<
[SNS, SubscribeQueueToTopicOptions],
Promise<void>,
string
>(forceSubscribeQueueToTopic, { cacheKey })

export { subscribeQueueToTopic }
