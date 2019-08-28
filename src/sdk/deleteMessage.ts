import { SQS } from 'aws-sdk'

import { schedule } from './utils'

const deleteMessage = (sqs: SQS, queueUrl: string, receiptHandle: string) => {
  return schedule(async () => {
    try {
      await sqs
        .deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle })
        .promise()
    } catch (error) {
      throw new Error(
        `Could not delete message with receipt handle "${receiptHandle}" from queue "${queueUrl}"\n${error.message}`,
      )
    }
  })
}

export { deleteMessage }
