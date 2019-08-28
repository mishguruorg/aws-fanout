import { SNS, SQS } from 'aws-sdk'

import { Credentials } from '../../index'

const resolve = (value?: any) => ({
  promise: () => Promise.resolve(value),
})

export type EventLog = [string, any][]
export type PolicyMap = Map<string, string>

const arn = {
  sqs: (i: string) => `arn:aws:sqs:region:id:${i}`,
  sns: (i: string) => `arn:aws:sns:region:id:${i}`,
}
const url = (i: string) => `https://${i}`
const unurl = (i: string) => i.slice(8)

export class MockSQS {
  private eventLog: EventLog
  private policyMap: PolicyMap

  public config: Credentials

  public constructor (
    eventLog: EventLog,
    policyMap: PolicyMap,
    config: Credentials,
  ) {
    this.eventLog = eventLog
    this.policyMap = policyMap
    this.config = config
  }

  public createQueue (options: SQS.Types.CreateQueueRequest) {
    this.eventLog.push(['sqs.createQueue', options])
    return resolve({
      QueueUrl: url(options.QueueName),
    })
  }

  public deleteQueue (options: SQS.Types.DeleteQueueRequest) {
    this.eventLog.push(['sqs.deleteQueue', options])
    return resolve()
  }

  public deleteMessage (options: SQS.Types.DeleteMessageRequest) {
    this.eventLog.push(['sqs.deleteMessage', options])
    return resolve()
  }

  public receiveMessage (options: SQS.Types.ReceiveMessageRequest) {
    this.eventLog.push(['sqs.receiveMessage', options])
    return resolve({
      Messages: ['Message'],
    })
  }

  public getQueueAttributes (options: SQS.Types.GetQueueAttributesRequest) {
    const queueName = unurl(options.QueueUrl)
    const attributes: Record<string, string> = {}

    if (options.AttributeNames.includes('QueueArn')) {
      attributes.QueueArn = arn.sqs(queueName)
    }
    if (options.AttributeNames.includes('Policy')) {
      attributes.Policy = this.policyMap.get(queueName)
    }

    this.eventLog.push(['sqs.getQueueAttributes', options])
    return resolve({ Attributes: attributes })
  }

  public setQueueAttributes (options: SQS.Types.SetQueueAttributesRequest) {
    this.eventLog.push(['sqs.setQueueAttributes', options])
    return resolve()
  }
}

export class MockSNS {
  private eventLog: EventLog
  public config: Credentials

  public constructor (eventLog: EventLog, config: Credentials) {
    this.eventLog = eventLog
    this.config = config
  }

  public createTopic (options: SNS.Types.CreateTopicInput) {
    this.eventLog.push(['sns.createTopic', options])
    return resolve({
      TopicArn: arn.sns(options.Name),
    })
  }

  public deleteTopic (options: SNS.Types.DeleteTopicInput) {
    this.eventLog.push(['sns.deleteTopic', options])
    return resolve()
  }

  public publish (options: SNS.Types.PublishInput) {
    this.eventLog.push(['sns.publish', options])
    return resolve({
      MessageId: 'MessageId',
    })
  }

  public subscribe (options: SNS.Types.SubscribeInput) {
    this.eventLog.push(['sns.subscribe', options])
    return resolve()
  }
}

const mockAws = () => {
  const eventLog: [string, any][] = []
  const policyMap: PolicyMap = new Map()

  return {
    eventLog,
    policyMap,
    SQS: MockSQS.bind(null, eventLog, policyMap),
    SNS: MockSNS.bind(null, eventLog),
  }
}

export { mockAws, arn, url }
