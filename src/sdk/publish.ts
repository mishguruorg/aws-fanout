import { SNS } from 'aws-sdk'

import { schedule } from './utils'

const publish = (sns: SNS, topicArn: string, message: string) => {
  return schedule(async () => {
    try {
      return await sns
        .publish({
          TopicArn: topicArn,
          MessageStructure: 'json',
          Message: JSON.stringify({ default: message }),
        })
        .promise()
    } catch (error) {
      throw new Error(`Could not publish message to topic "${topicArn}"
Message: ${message}
${error.message}`)
    }
  })
}

export { publish }
