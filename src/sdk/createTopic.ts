import { SNS } from 'aws-sdk'
import mem from 'mem'

import { schedule, cacheKey } from './utils'

const forceCreateTopic = (sns: SNS, topicName: string): Promise<string> => {
  return schedule(async () => {
    try {
      const topic = await sns.createTopic({ Name: topicName }).promise()
      return topic.TopicArn
    } catch (error) {
      throw new Error(
        `Could not create topic with name "${topicName}"\n${error.message}`,
      )
    }
  })
}

const createTopic = mem<[SNS, string], Promise<string>, string>(
  forceCreateTopic,
  { cacheKey },
)

export { createTopic }
