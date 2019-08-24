import { Credentials } from '../../index'

const resolve = (value?: any) => ({
  promise: () => Promise.resolve(value),
})

type EventLog = [string, any][]

const arn = {
  sqs: (i: string) => `arn:aws:sqs:region:id:${i}`,
  sns: (i: string) => `arn:aws:sns:region:id:${i}`,
}
const url = (i: string) => `https://${i}`
const unurl = (i: string) => i.slice(8)

export class MockSQS {
  private eventLog: EventLog
  public config: Credentials

  public constructor (eventLog: EventLog, config: Credentials) {
    this.eventLog = eventLog
    this.config = config
  }

  public createQueue (options: any) {
    this.eventLog.push(['sqs.createQueue', options])
    return resolve({
      QueueUrl: url(options.QueueName),
    })
  }

  public deleteQueue (options: any) {
    this.eventLog.push(['sqs.deleteQueue', options])
    return resolve()
  }

  public deleteMessage (options: any) {
    this.eventLog.push(['sqs.deleteMessage', options])
    return resolve()
  }

  public receiveMessage (options: any) {
    this.eventLog.push(['sqs.receiveMessage', options])
    return resolve({
      Messages: ['Message'],
    })
  }

  public getQueueAttributes (options: any) {
    this.eventLog.push(['sqs.getQueueAttributes', options])
    return resolve({
      Attributes: {
        QueueArn: arn.sqs(unurl(options.QueueUrl)),
        Policy: undefined,
      },
    })
  }

  public setQueueAttributes (options: any) {
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

  public createTopic (options: any) {
    this.eventLog.push(['sns.createTopic', options])
    return resolve({
      TopicArn: arn.sns(options.Name),
    })
  }

  public deleteTopic (options: any) {
    this.eventLog.push(['sns.deleteTopic', options])
    return resolve()
  }

  public publish (options: any) {
    this.eventLog.push(['sns.publish', options])
    return resolve({
      MessageId: 'MessageId',
    })
  }

  public subscribe (options: any) {
    this.eventLog.push(['sns.subscribe', options])
    return resolve()
  }
}

const mockAws = () => {
  const eventLog: [string, any][] = []

  return {
    eventLog,
    SQS: MockSQS.bind(null, eventLog),
    SNS: MockSNS.bind(null, eventLog),
  }
}

export { mockAws, arn, url }
