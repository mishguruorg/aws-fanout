import { SQS } from 'aws-sdk'

import { getQueueAttributes } from './getQueueAttributes'

const getQueueArnByUrl = async (
  sqs: SQS,
  queueUrl: string,
): Promise<string> => {
  const attributes = await getQueueAttributes(sqs, queueUrl, ['QueueArn'])
  return attributes.QueueArn
}

export { getQueueArnByUrl }
