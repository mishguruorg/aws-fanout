# AWS-Fanout

A library wrapping SNS and SQS to allow for human readable names when using a
fanout technique. Now you use the fanout pattern without needing to hard code
ARNS throughout your application!

## Installation

This module is installed via npm:

```bash
$ npm install aws-fanout
```

## Example Usage

```typescript
import { subscribeQueuesToTopics, publish } from 'aws-fanout'

const queueName = 'post-office'
const topicNames = ['send-email']

await subscribeQueuesToTopics(credentials, topicNames, queueName)

await publish(credentials, 'send-email', {
  address: 'john.smith@example.co.nz',
  subject: 'Good Morning John',
})
```

## Environment Variables

### `AWS_FANOUT_RATE_LIMIT_MS`

**Default value: `10`**

The API calls to SQS/SNS are rate limited.

By default there is a maximum of request made per 10ms. This results in a
maximum of 100 requests per second.

## API v2 Documentation

- [`createQueue(credentials, { queueName })`](#v2createQueue)
- [`createTopic(credentials, { topicName })`](#v2createTopic)
- [`deleteQueue(credentials, { queueName })`](#v2deleteQueue)
- [`deleteTopic(credentials, { topicName })`](#v2deleteTopic)
- [`publishMessage(credentials, { topicName, message })`](#v2publishMessage)
- [`receiveMessage(credentials, { queueName, maxNumberOfMessages, visibilityTimeout })`](#v2receiveMessage)
- [`deleteMessage(credentials, { queueName, receiptHandle })`](#v2deleteMessage)
- [`setQueuePolicy(credentials, { queueName, topicNames, ignoreExistingPolicy })`](#v2setQueuePolicy)
- [`setQueueRedrivePolicy(credentials, { queueName, deadLetterQueueName, maxReceiveCount })`](#v2setQueueRedrivePolicy)
- [`subscribeQueueToTopic(credentials, { queueName, topicName })`](#v2subscribeQueueToTopic)

### `v2.createQueue`

Create a single queue on SQS.

- `credentials`: [Credentials](#credentials)
- `options.queueName`: name of the queue to create

```typescript
import { createQueue } from 'aws-sdk'

await createQueue(credentials, {
  queueName: 'logger'
})
```

### `v2.createTopic`

Create a single topic on SNS.

- `credentials`: [Credentials](#credentials)
- `options.topicName`: name of the topic to create

```typescript
import { createTopic } from 'aws-sdk'

await createTopic(credentials, {
  topicName: 'create-account'
})
```

### `v2.deleteQueue`

Delete a queue.

- `credentials`: [Credentials](#credentials)
- `options.queueName`: name of the queue to delete

```typescript
import { deleteQueue } from 'aws-sdk'

await deleteQueue(credentials, {
  queueName: 'my-queue-name'
})
```

### `v2.deleteTopic`

Delete a topic.

- `credentials`: [Credentials](#credentials)
- `options.topicName`: name of the topic to delete

```typescript
import { deleteTopic } from 'aws-sdk'

await deleteTopic(credentials, {
  topicName: 'my-topic-name'
})
```

### `v2.publishMessage`

Publish a message with a particular topic. Any queues that are subscribed to
the topic will receive a copy of it.

- `credentials`: [Credentials](#credentials)
- `options.topicName`: name of the topic
- `options.message`: message payload to send, must be a string

```typescript
import { subscribeQueueTopicsByTheirPrefix } from 'aws-sdk'

await publish(credentials,
  topicName: 'create',
  message: JSON.stringify({
    userId: 123,
    email: 'john.smith@example.co.nz'
  })
)
```

### `v2.receiveMessage`

Listen for messages on the queue.

- `credentials`: [Credentials](#credentials)
- `options.maxNumberOfMessages`: Maximum number of messages to retrieve
- `options.visibilityTimeout`: The duration (in seconds) that the received
  messages are hidden from subsequent retrieve requests
- `options.queueName`: Name of the queue to receive messages from

```typescript
import { receiveMessage } from 'aws-sdk'

const messages = await receiveMessage(
  credentials,
  maxNumberOfMessages: 5,
  visibilityTimeout: 15,
  queueName: 'actions'
)
```

### `v2.deleteMessage`

Remove a message from a queue.

After you have finished receiving a message from the queue, you should remove
it so that it does not get sent again.

- `credentials`: [Credentials](#credentials)
- `options.queueName`: name of the queue to delete the message from
- `options.receiptHandle`: the receipt handle of the mesage to delete

```typescript
import { receiveMessage, deleteMessage } from 'aws-sdk'

const queueName = 'my-queue-name'

const messages = await receiveMessage(credentials, {
  maxNumberOfMessages: 1,
  visibilityTimeout: 10,
  queueName
})

if (messages.length > 0) {
  await deleteMessage(credentials, {
    queueName,
    receiptHandle: messages[0].ReceiptHandle
  })
}
```

### `v2.setQueuePolicy`

Subscribes a queue to a list of topics.

If the queue or topics do not exist, they will be created.

- `credentials`: [Credentials](#credentials)
- `options.queueName`: queue to forward topics to
- `options.topicNames`: list of topics to subscribe to
- `options.ignoreExistingPolicy`: whether to preserve any existing topics that
  have previously been allowed to post to this queue.

```typescript
import { subscribeQueuesToTopics } from 'aws-sdk'

await subscribeQueuesToTopics(credentials, {
  queueName: 'actions',
  topicNames: ['create', 'read', 'update', 'destroy'],
  ignoreExistingPolicy: false
})
```

If you have a large number of topics to create, you may start hitting the AWS
limit on how large the queue policy can be.  Instead you can define the queue
to accept any topic that matches a wildcard pattern.

```typescript
import { subscribeQueuesToTopics } from 'aws-sdk'

await subscribeQueuesToTopics(credentials, {
  queueName: 'logger',
  topicNames: ['*'],
  ignoreExistingPolicy: false
})
```

### `v2.setQueueRedrivePolicy`

- `credentials`: [Credentials](#credentials)
- `options.deadLetterQueueName`: (optional) The name of dead-letter queue to
  which SQS moves messages after the value of "maxReceiveCount" is exceeded. 
- `options.maxReceiveCount`: (optional, default = 5) The number of times a
  message is delivered to the source queue before being moved to the
  dead-letter queue. When the ReceiveCount for a message exceeds the
  maxReceiveCount for a queue, SQS moves the message to the dead-letter-queue. 

```typescript
import { setQueueRedrivePolicy } from 'aws-sdk'

await setQueueRedrivePolicy(credentials, {
  queueName: 'actions',
  deadLetterQueueName: 'deadLetter',
  maxReceiveCount: 5
})
```

### `v2.subscribeQueueToTopic`

Subscribe a queue to a topic.

When the topic is published, a copy of it will be sent to the queue.

- `credentials`: [Credentials](#credentials)
- `options.queueName`: name of the queue
- `options.topicName`: name of the topic

```typescript
import { subscribeQueueToTopic } from 'aws-sdk'

await subscribeQueueToTopic(credentials, {
  queueName: 'actions',
  topicName: 'create'
})
```

## API v1 Documentation

- [`registerQueues(credentials, queueNames)`](#v1registerQueues)
- [`registerTopics(credentials, topicNames)`](#v1registerTopics)
- [`deleteQueue(credentials, queueName)`](#v1deleteQueue)
- [`deleteTopic(credentials, topicName)`](#v1deleteTopic)
- [`publish(credentials, topicName, message)`](#v1publish)
- [`receiveMessage(credentials, maxNumberOfMessages, visibilityTimeout, queueName)`](#v1receiveMessage)
- [`deleteMessage(credentials, queueName, receiptHandle)`](#v1deleteMessage)
- [`subscribeQueueTopicsByTheirPrefix(credentials, topicNames, queueName, [deadLetterQueueName], [maxReceiveCount=5]`](#v1subscribeQueueTopicsByTheirPrefix)
- [`subscribeQueuesToTopics(credentials, topicNames, queueName, [deadLetterQueueName], [maxReceiveCount=5])`](#v1subscribeQueuesToTopics)

### `v1.registerQueues`

Create multiple queues on SQS.

- `credentials`: [Credentials](#credentials)
- `queueNames`: list of queues to create

```typescript
import { registerQueues } from 'aws-sdk'

const queueNames = [
  'logs',
  'errors',
  'actions',
]

await registerQueues(credentials, queueNames)
```

### `v1.registerTopics`

Create multiple topics on SNS.

- `credentials`: [Credentials](#credentials)
- `topicNames`: list of topics to create

```typescript
import { registerTopics } from 'aws-sdk'

const topicNames = [
  'create-account',
  'read-account',
  'update-account',
  'destroy-account',
]

await registerTopics(credentials, topicNames)
```

### `v1.deleteQueue`

Delete a queue.

- `credentials`: [Credentials](#credentials)
- `queueName`: name of the queue to delete

```typescript
import { deleteQueue } from 'aws-sdk'

const queueName = 'my-queue-name'

await deleteQueue(credentials, queueName)
```

### `v1.deleteTopic`

Delete a topic.

- `credentials`: [Credentials](#credentials)
- `topicName`: name of the topic to delete

```typescript
import { deleteTopic } from 'aws-sdk'

const topicName = 'my-topic-name'

await deleteTopic(credentials, topicName)
```

### `v1.publish`

Publish a message with a particular topic. Any queues that are subscribed to
the topic will receive a copy of it.

The message will be serialized using `JSON.stringify`.

- `credentials`: [Credentials](#credentials)
- `topicName`: name of the topic
- `message`: message payload to send

```typescript
import { subscribeQueueTopicsByTheirPrefix } from 'aws-sdk'

const topicName = 'create'
const message = {
  userId: 123,
  email: 'john.smith@example.co.nz'
}

await publish(credentials, topicName, message)
```

### `v1.receiveMessage`

Listen for messages on the queue.

- `credentials`: [Credentials](#credentials)
- `maxNumberOfMessages`: Maximum number of messages to retrieve
- `visibilityTimeout`: The duration (in seconds) that the received messages are
  hidden from subsequent retrieve requests
- `queueName`: Name of the queue to receive messages from

```typescript
import { receiveMessage } from 'aws-sdk'

const maxNumberOfMessages = 5
const visibilityTimeout = 15
const queueName = 'actions'

const messages = await receiveMessage(
  credentials,
  maxNumberOfMessages,
  visibilityTimeout,
  queueName
)
```

### `v1.deleteMessage`

Remove a message from a queue.

After you have finished receiving a message from the queue, you should remove
it so that it does not get sent again.

- `credentials`: [Credentials](#credentials)
- `queueName`: name of the queue to delete the message from
- `receiptHandle`: the receipt handle of the mesage to delete

```typescript
import { receiveMessage, deleteMessage } from 'aws-sdk'

const queueName = 'my-queue-name'

const messages = await receiveMessage(credentials, 1, 10, queueName)
if (messages.length > 0) {
  const receiptHandle = messages[0].ReceiptHandle
  await deleteMessage(credentials, queueName, receiptHandle)
}
```

### `v1.subscribeQueuesToTopics`

Subscribes a queue to a list of topics.

If the queue or topics do not exist, they will be created.

- `credentials`: [Credentials](#credentials)
- `topicNames`: list of topics to subscribe to
- `queueName`: queue to forward topics to
- `deadLetterQueueName`: (optional) The name of dead-letter queue to which SQS moves messages after the value of "maxReceiveCount" is exceeded. 
- `maxReceiveCount`: (optional, default = 5) The number of times a message is delivered to the source queue before being moved to the dead-letter queue. When the ReceiveCount for a message exceeds the maxReceiveCount for a queue, SQS moves the message to the dead-letter-queue. 

```typescript
import { subscribeQueuesToTopics } from 'aws-sdk'

const topicNames = ['create', 'read', 'update', 'destroy']
const queueName = 'actions'
const deadLetterQueueName = 'dead-letter'
const maxReceiveCount = 5

await subscribeQueuesToTopics(
  credentials,
  topicNames,
  queueName,
  deadLetterQueueName,
  maxReceiveCount
)
```

### `v1.subscribeQueueTopicsByTheirPrefix`

If you have a large number of topics to create, you may start hitting the
AWS limit on how large the queue policy can be.

Instead you can define the queue to accept any topic that matches a wildcard.

- `credentials`: [Credentials](#credentials)
- `topicNames`: list of topics to subscribe to
- `queueName`: queue to forward topics to
- `deadLetterQueueName`: (optional) The name of dead-letter queue to which SQS moves messages after the value of "maxReceiveCount" is exceeded. 
- `maxReceiveCount`: (optional, default = 5) The number of times a message is delivered to the source queue before being moved to the dead-letter queue. When the ReceiveCount for a message exceeds the maxReceiveCount for a queue, SQS moves the message to the dead-letter-queue. 

```typescript
import { subscribeQueueTopicsByTheirPrefix } from 'aws-sdk'

const topicNames = ['create', 'read', 'update', 'destroy']
const queueName = 'actions'
const deadLetterQueueName = 'dead-letter'
const maxReceiveCount = 5

await subscribeQueueTopicsByTheirPrefix(
  credentials,
  topicNames,
  queueName,
  deadLetterQueueName,
  maxReceiveCount
)
```

## Credentials

The `credentials` object is passed through to the `SNS`/`SQS` constructor.

- [SQS Constructor API Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#constructor-property)
- [SNS Constructor API Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#constructor-property)

If you are using IAM roles or a shared credentials file, you can just leave
this empty.

[Reference: Setting AWS Credentials in Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html)

If you want to load credentials from environment variables, then you can do
something like this:

```typescript
const credentials = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}
```
