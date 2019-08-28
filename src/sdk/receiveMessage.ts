import { SQS } from 'aws-sdk'

interface ReceiveMessageOptions {
  queueUrl: string,
  maxNumberOfMessages: number,
  visibilityTimeout: number,
}

const receiveMessage = async (sqs: SQS, options: ReceiveMessageOptions) => {
  const { queueUrl, maxNumberOfMessages, visibilityTimeout } = options
  try {
    return await sqs
      .receiveMessage({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxNumberOfMessages,
        MessageAttributeNames: ['All'],
        VisibilityTimeout: visibilityTimeout,
        WaitTimeSeconds: 10,
      })
      .promise()
  } catch (error) {
    throw new Error(
      `Could not receive message on queue "${queueUrl}"\n${error.message}`,
    )
  }
}

export { receiveMessage }
