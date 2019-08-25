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

## API Documentation

- [`deleteTopic(c, topicName)`](#deleteTopic)
- [`deleteQueue(c, queueName)`](#deleteQueue)
- [`deleteMessage(c, queueName, receiptHandle)`](#deleteMessage)
- [`receiveMessage(c, number, timeout, queueName)`](#receiveMessage)
- [`registerTopics(c, topicNames)`](#registerTopics)
- [`registerQueues(c, queueNames)`](#registerQueues)
- [`subscribeQueuesToTopics(c, topicNames, queueName, ...)`](#subscribeQueuesToTopics)
- [`subscribeQueueTopicsByTheirPrefix(c, topicNames, queueName, ...)`](#subscribeQueueTopicsByTheirPrefix)
- [`publish(c, topicName, message)`](#publish)

### `deleteTopic`

Delete a topic.

- `credentials`: SNS credentials
- `topicName`: name of the topic to delete

```typescript
import { deleteTopic } from 'aws-sdk'

const topicName = 'my-topic-name'

await deleteTopic(credentials, topicName)
```

### `deleteQueue`

Delete a queue.

- `credentials`: SQS credentials
- `queueName`: name of the queue to delete

```typescript
import { deleteQueue } from 'aws-sdk'

const queueName = 'my-queue-name'

await deleteQueue(credentials, queueName)
```

### `deleteMessage`

Remove a message from a queue.

After you have finished receiving a message from the queue, you should remove
it so that it does not get sent again.

- `credentials`: SQS credentials
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

### `registerTopics`

Create multiple topics on SNS.

- `credentials`: SNS credentials
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

### `registerQueues`

Create multiple queues on SNS.

- `credentials`: SNS credentials
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

### `receiveMessage`

Listen for messages on the queue.

- `credentials`: SQS credentials
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

### `subscribeQueuesToTopics`

Subscribes a queue to a list of topics.

If the queue or topics do not exist, they will be created.

- `credentials`: SQS/SNS credentials
- `topicNames`: list of topics to subscribe to
- `queueName`: queue to forward topics o
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

### `subscribeQueueTopicsByTheirPrefix`

If you have a large number of topics to create, you may start hitting the
AWS limit on how large the queue policy can be.

Instead you can define the queue to accept any topic that matches a wildcard.

- `credentials`: SQS/SNS credentials
- `topicNames`: list of topics to subscribe to
- `queueName`: queue to forward topics o
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

### `publish`

Publish a message with a particular topic. Any queues that are subscribed to
the topic will receive a copy of it.

The message will be serialized using `JSON.stringify`.

- `credentials`: SNS credentials
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

### Credentials

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
