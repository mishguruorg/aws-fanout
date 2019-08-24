import { SQS } from 'aws-sdk'

import { createQueue } from './createQueue'
import { getQueueArnByUrl } from './getQueueArnByUrl'

const getQueueArnByName = async (
  sqs: SQS,
  queueName: string,
): Promise<string> => {
  const queueUrl = await createQueue(sqs, queueName)
  return getQueueArnByUrl(sqs, queueUrl)
}

export { getQueueArnByName }
