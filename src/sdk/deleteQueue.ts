import { SQS } from 'aws-sdk'

import { schedule } from './utils'

const deleteQueue = (sqs: SQS, queueUrl: string) => {
  return schedule(async () => {
    try {
      await sqs.deleteQueue({ QueueUrl: queueUrl }).promise()
    } catch (error) {
      throw new Error(`Could not delete queue "${queueUrl}"\n${error.message}`)
    }
  })
}

export { deleteQueue }
