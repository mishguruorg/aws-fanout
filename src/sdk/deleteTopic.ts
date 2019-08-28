import { SNS } from 'aws-sdk'

import { schedule } from './utils'

const deleteTopic = (sns: SNS, topicArn: string) => {
  return schedule(async () => {
    try {
      await sns.deleteTopic({ TopicArn: topicArn }).promise()
    } catch (error) {
      throw new Error(`Could not delete topic "${topicArn}"\n${error.message}`)
    }
  })
}

export { deleteTopic }
