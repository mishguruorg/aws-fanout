import { SQS } from 'aws-sdk'
import mem from 'mem'

import { schedule, cacheKey } from './utils'

const forceCreateQueue = (sqs: SQS, queueName: string) => {
  return schedule(async () => {
    try {
      const queue = await sqs.createQueue({ QueueName: queueName }).promise()
      return queue.QueueUrl
    } catch (error) {
      throw new Error(`Could not create queue "${queueName}"\n${error.message}`)
    }
  })
}

const createQueue = mem<[SQS, string], Promise<string>, string>(
  forceCreateQueue,
  { cacheKey },
)

export { createQueue }
