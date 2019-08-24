import { SQS, SNS } from 'aws-sdk'
import mem from 'mem'
import commonPrefix from 'common-prefix'
import Bottleneck from 'bottleneck'
import PProgress from 'p-progress'

import buildQueuePolicy from './buildQueuePolicy'

type Credentials = SQS.Types.ClientConfiguration & SNS.Types.ClientConfiguration

const DEFAULT_MAX_RECEIVE_COUNT = 5
const RATE_LIMIT_MS = 10

const limiter = new Bottleneck({
  minTime: RATE_LIMIT_MS,
})

const sqsCacheKey = (sqs: SQS, ...args: any[]) => {
  return sqs.config.accessKeyId + JSON.stringify(args)
}

const snsCacheKey = (sns: SNS, ...args: any[]) => {
  return sns.config.accessKeyId + JSON.stringify(args)
}

const createTopic = mem<[SNS, string], Promise<string>, string>(
  (sns: SNS, topicName: string): Promise<string> => {
    return limiter.schedule(async () => {
      try {
        const topic = await sns.createTopic({ Name: topicName }).promise()
        return topic.TopicArn
      } catch (error) {
        console.error(error)
        throw new Error(`Could not create topic with name "${topicName}"`)
      }
    })
  },
  { cacheKey: snsCacheKey },
)

interface SubscribeTopicToQueueOptions {
  queueArn: string,
  topicArn: string,
}

const subscribeTopicToQueue = mem<
[SNS, SubscribeTopicToQueueOptions],
Promise<void>,
string
>(
  (sns: SNS, options: SubscribeTopicToQueueOptions) => {
    return limiter.schedule(async () => {
      const { topicArn, queueArn } = options
      try {
        await sns
          .subscribe({
            Endpoint: queueArn,
            TopicArn: topicArn,
            Protocol: 'sqs',
          })
          .promise()
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not subscribe topic "${topicArn}" to queue ${queueArn}`,
        )
      }
    })
  },
  { cacheKey: snsCacheKey },
)

const createQueue = mem<[SQS, string], Promise<string>, string>(
  (sqs: SQS, queueName: string): Promise<string> => {
    return limiter.schedule(async () => {
      try {
        const queue = await sqs.createQueue({ QueueName: queueName }).promise()
        return queue.QueueUrl
      } catch (error) {
        console.error(error)
        throw new Error(`Could not create queue "${queueName}"`)
      }
    })
  },
  { cacheKey: sqsCacheKey },
)

const getQueueAttributes = mem<
[SQS, string, SQS.Types.AttributeNameList],
Promise<SQS.Types.QueueAttributeMap>,
string
>(
  (
    sqs: SQS,
    queueUrl: string,
    attributeNames: SQS.Types.AttributeNameList,
  ): Promise<SQS.Types.QueueAttributeMap> => {
    return limiter.schedule(async () => {
      try {
        const queue = await sqs
          .getQueueAttributes({
            QueueUrl: queueUrl,
            AttributeNames: attributeNames,
          })
          .promise()
        return queue.Attributes
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not get attributes "${attributeNames}" from queue "${queueUrl}"`,
        )
      }
    })
  },
  { cacheKey: sqsCacheKey },
)

const setQueueAttributes = (
  sqs: SQS,
  queueUrl: string,
  attributes: SQS.Types.QueueAttributeMap,
) => {
  return limiter.schedule(async () => {
    try {
      await sqs
        .setQueueAttributes({ QueueUrl: queueUrl, Attributes: attributes })
        .promise()
    } catch (error) {
      console.error(error)
      throw new Error(`Could not set queue attributes for queue "${queueUrl}"
  Attributes: ${JSON.stringify(attributes, null, 2)}`)
    }
  })
}

const deleteTopic = (credentials: Credentials, topicName: string) => {
  return limiter.schedule(async () => {
    const sns = new SNS(credentials)
    const topicArn = await createTopic(sns, topicName)
    return sns.deleteTopic({ TopicArn: topicArn }).promise()
  })
}

const deleteQueue = (credentials: Credentials, queueName: string) => {
  return limiter.schedule(async () => {
    const sqs = new SQS(credentials)
    const queueUrl = await createQueue(sqs, queueName)
    return sqs.deleteQueue({ QueueUrl: queueUrl }).promise()
  })
}

const deleteMessage = (
  credentials: Credentials,
  queueName: string,
  receiptHandle: string,
) => {
  return limiter.schedule(async () => {
    const sqs = new SQS(credentials)
    const queueUrl = await createQueue(sqs, queueName)
    return sqs
      .deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle })
      .promise()
  })
}

/* Helper functions */

const getQueueArnByUrl = async (
  sqs: SQS,
  queueUrl: string,
): Promise<string> => {
  const attributes = await getQueueAttributes(sqs, queueUrl, ['QueueArn'])
  return attributes.QueueArn
}

const getQueueArnByName = async (
  sqs: SQS,
  queueName: string,
): Promise<string> => {
  const queueUrl = await createQueue(sqs, queueName)
  return getQueueArnByUrl(sqs, queueUrl)
}

const registerTopics = (credentials: Credentials, topicNames: string[]) => {
  const sns = new SNS(credentials)
  return Promise.all(topicNames.map((topicName) => createTopic(sns, topicName)))
}

const registerQueues = (credentials: Credentials, queueNames: string[]) => {
  const sqs = new SQS(credentials)
  return Promise.all(queueNames.map((queueName) => createQueue(sqs, queueName)))
}

const subscribeQueueToTopics = (
  credentials: Credentials,
  topicNames: string[],
  queueName: string,
  deadLetterQueueName?: string,
  maxReceiveCount: number = DEFAULT_MAX_RECEIVE_COUNT,
) => {
  return new PProgress(async (resolve, reject, progress) => {
    try {
      let counter = 0
      const counterTotal = 3 + topicNames.length * 2
      const tick = () => {
        counter += 1
        progress(counter / counterTotal)
      }

      const sqs = new SQS(credentials)
      const sns = new SNS(credentials)

      const queueUrl = await createQueue(sqs, queueName)
      tick()

      const queueAttributes = await getQueueAttributes(sqs, queueUrl, [
        'QueueArn',
        'Policy',
      ])
      tick()

      const queueArn = queueAttributes.QueueArn
      const queuePolicy = queueAttributes.Policy

      const existingTopicArns =
        queuePolicy == null
          ? []
          : JSON.parse(queuePolicy)
            .Statement.filter((item: any) => {
              return item.Action === 'SQS:SendMessage'
            })
            .map((item: any) => {
              if (
                item.Condition == null ||
                  item.Condition.ArnEquals == null
              ) {
                return []
              }
              return item.Condition.ArnEquals['aws:SourceArn']
            })
            .flat()

      const topicArns = await Promise.all(
        topicNames.map(async (topicName) => {
          const topicArn = await createTopic(sns, topicName)
          tick()
          return topicArn
        }),
      )

      const allTopicArns = [...new Set([...existingTopicArns, ...topicArns])]

      const attributes: SQS.Types.QueueAttributeMap = {
        Policy: buildQueuePolicy({
          queueArn,
          topicArnList: allTopicArns,
        }),
      }

      if (deadLetterQueueName != null) {
        const deadLetterTargetArn = await getQueueArnByName(
          sqs,
          deadLetterQueueName,
        )
        attributes.RedrivePolicy = JSON.stringify({
          maxReceiveCount,
          deadLetterTargetArn,
        })
      }

      await setQueueAttributes(sqs, queueUrl, attributes)
      tick()

      await Promise.all(
        topicArns.map(async (topicArn) => {
          await subscribeTopicToQueue(sns, {
            topicArn,
            queueArn,
          })
          tick()
        }),
      )
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

const subscribeQueueTopicsByTheirPrefix = (
  credentials: Credentials,
  topicNames: string[],
  queueName: string,
  deadLetterQueueName?: string,
  maxReceiveCount: number = DEFAULT_MAX_RECEIVE_COUNT,
) => {
  return new PProgress(async (resolve, reject, progress) => {
    try {
      let counter = 0
      const counterTotal = 2 + topicNames.length * 2
      const tick = () => {
        counter += 1
        progress(counter / counterTotal)
      }
      const sqs = new SQS(credentials)
      const sns = new SNS(credentials)

      const topicPrefix = commonPrefix(topicNames)

      const queueUrl = await createQueue(sqs, queueName)
      tick()

      const queueArn = await getQueueArnByUrl(sqs, queueUrl)
      tick()

      const arnId = queueArn.match(/^arn:aws:sqs:([^:]*:[^:]*):/)[1]
      const topicArnPrefix = `arn:aws:sns:${arnId}:${topicPrefix}*`

      const attributes: SQS.Types.QueueAttributeMap = {
        Policy: buildQueuePolicy({
          queueArn,
          topicArnList: [topicArnPrefix],
        }),
      }

      if (deadLetterQueueName != null) {
        const deadLetterTargetArn = await getQueueArnByName(
          sqs,
          deadLetterQueueName,
        )
        attributes.RedrivePolicy = JSON.stringify({
          maxReceiveCount,
          deadLetterTargetArn,
        })
      }

      await Promise.all(
        topicNames.map(async (topicName) => {
          const topicArn = await createTopic(sns, topicName)
          tick()

          await subscribeTopicToQueue(sns, { topicArn, queueArn })
          tick()
        }),
      )
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

const receiveMessage = async (
  credentials: Credentials,
  maxNumberOfMessages: number,
  visibilityTimeout: number,
  queueName: string,
) => {
  const sqs = new SQS(credentials)
  const queueUrl = await createQueue(sqs, queueName)
  try {
    const messages = await sqs
      .receiveMessage({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxNumberOfMessages,
        MessageAttributeNames: ['All'],
        VisibilityTimeout: visibilityTimeout,
        WaitTimeSeconds: 10,
      })
      .promise()
    return messages
  } catch (error) {
    console.error(error)
    throw new Error(`Could not receive message on queue "${queueName}"`)
  }
}

const publish = async (
  credentials: Credentials,
  topicName: string,
  message: Record<string, any>,
) => {
  const sns = new SNS(credentials)
  const topicArn = await createTopic(sns, topicName)
  return sns
    .publish({
      TopicArn: topicArn,
      MessageStructure: 'json',
      Message: JSON.stringify({ default: JSON.stringify(message) }),
    })
    .promise()
}

export {
  deleteTopic,
  deleteQueue,
  deleteMessage,
  receiveMessage,
  registerTopics,
  registerQueues,
  subscribeQueueToTopics,
  subscribeQueueTopicsByTheirPrefix,
  publish,
}
