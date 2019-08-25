import anyTest, { TestInterface } from 'ava'
import * as stu from 'stu'
import tk from 'timekeeper'

import { mockAws, EventLog, PolicyMap } from './mockAws'
import { Credentials } from '../../index'

tk.freeze(new Date(1234567890123))

const credentials = {
  region: 'REGION',
  accessKeyId: 'ACCESS_KEY_ID',
  secretAccessKey: 'SECRET_ACCESS_KEY',
}

const test = anyTest as TestInterface<{
  eventLog: EventLog,
  policyMap: PolicyMap,
  fanout: {
    deleteTopic: (c: Credentials, t: string) => Promise<void>,
    deleteQueue: (c: Credentials, q: string) => Promise<void>,
    deleteMessage: (c: Credentials, q: string, r: string) => Promise<void>,
    receiveMessage: (
      c: Credentials,
      n: number,
      v: number,
      q: string,
    ) => Promise<void>,
    registerTopics: (c: Credentials, t: string[]) => Promise<void>,
    registerQueues: (c: Credentials, q: string[]) => Promise<void>,
    subscribeQueueToTopics: (
      c: Credentials,
      t: string[],
      q: string,
      d?: string,
      m?: number,
    ) => Promise<void>,
    subscribeQueueTopicsByTheirPrefix: (
      c: Credentials,
      t: string[],
      q: string,
      d?: string,
      m?: number,
    ) => Promise<void>,
    publish: (
      c: Credentials,
      t: string,
      m: Record<string, any>,
    ) => Promise<Record<string, string>>,
  },
}>

test.beforeEach((t) => {
  stu.flush('../../sdk/withCredentials')
  stu.flush('../../sdk/index')
  stu.flush('../../v1')

  const { eventLog, policyMap } = stu.mock('aws-sdk', mockAws)
  const fanout = stu.test('../../index')

  t.context = {
    eventLog,
    policyMap,
    fanout,
  }
})

export { test, credentials }
