import { SQS } from 'aws-sdk'
import mem from 'mem'

import { schedule, cacheKey } from './utils'

const forceGetQueueAttributes = (
  sqs: SQS,
  queueUrl: string,
  attributeNames: SQS.Types.AttributeNameList,
) => {
  return schedule(async () => {
    try {
      const queue = await sqs
        .getQueueAttributes({
          QueueUrl: queueUrl,
          AttributeNames: attributeNames,
        })
        .promise()
      return queue.Attributes
    } catch (error) {
      throw new Error(
        `Could not get attributes "${attributeNames}" from queue "${queueUrl}"\n${error.message}`,
      )
    }
  })
}

const getQueueAttributes = mem<
[SQS, string, SQS.Types.AttributeNameList],
Promise<SQS.Types.QueueAttributeMap>,
string
>(forceGetQueueAttributes, { cacheKey })

export { getQueueAttributes }
