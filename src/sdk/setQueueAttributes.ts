import { SQS } from 'aws-sdk'

import { schedule } from './utils'

const setQueueAttributes = (
  sqs: SQS,
  queueUrl: string,
  attributes: SQS.Types.QueueAttributeMap,
) => {
  return schedule(async () => {
    try {
      await sqs
        .setQueueAttributes({ QueueUrl: queueUrl, Attributes: attributes })
        .promise()
    } catch (error) {
      throw new Error(`Could not set queue attributes for queue "${queueUrl}"
Attributes: ${JSON.stringify(attributes, null, 2)}
${error.message}`)
    }
  })
}

export { setQueueAttributes }
