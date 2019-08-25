import test from 'ava'
import { inspect } from 'util'

import parseQueuePolicy from './parseQueuePolicy'

test('should handle invalid values', (t) => {
  const values: string[] = [
    undefined,
    null,
    '',
    '0',
    '{}',
    '{"Statement":false}',
    '{"Statement":{}}',
    '{"Statement":[{"Action":"SQS:SendMessage"}]}',
    '{"Statement":[{"Action":"SQS:SendMessage","Condition":{}}]}',
    '{"Statement":[{"Action":"SQS:SendMessage","Condition":{"ArnEquals":{}}}]}',
    '{"Statement":[{"Action":"SQS:SendMessage","Condition":{"ArnEquals":{"aws:SourceArn":true}}}]}',
    '{"Statement":[{"Action":"SQS:SendMessage","Condition":{"ArnEquals":{"aws:SourceArn":[true]}}}]}',
  ]

  for (const value of values) {
    t.deepEqual(parseQueuePolicy(value), [], inspect(value))
  }
})

test('should parse policy with single arn', (t) => {
  const policy =
    '{"Statement":[{"Action":"SQS:SendMessage","Condition":{"ArnEquals":{"aws:SourceArn":"single-arn"}}}]}'
  t.deepEqual(parseQueuePolicy(policy), ['single-arn'])
})

test('should parse policy with multiple arns', (t) => {
  const policy =
    '{"Statement":[{"Action":"SQS:SendMessage","Condition":{"ArnEquals":{"aws:SourceArn":["arn-one","arn-two","arn-three"]}}}]}'
  t.deepEqual(parseQueuePolicy(policy), ['arn-one', 'arn-two', 'arn-three'])
})
