import { SQS } from 'aws-sdk'
import mem from 'mem'

import { schedule, cacheKey } from './utils'

const forceGetQueueAttributes = (sqs: SQS, queueUrl: string) => {
  return schedule(async () => {
    try {
      const queue = await sqs
        .getQueueAttributes({
          QueueUrl: queueUrl,
          AttributeNames: ['QueueArn', 'Policy'],
        })
        .promise()

      return {
        queueArn: queue.Attributes.QueueArn,
        queuePolicy: queue.Attributes.Policy,
      }
    } catch (error) {
      throw new Error(
        `Could not get attributes from queue "${queueUrl}"\n${error.message}`,
      )
    }
  })
}

const getQueueAttributes = mem<
[SQS, string],
Promise<SQS.Types.QueueAttributeMap>,
string
>(forceGetQueueAttributes, { cacheKey })

export { getQueueAttributes }
