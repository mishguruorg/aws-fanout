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

(credentials, queueName)

### `deleteMessage`

(credentials, queueName, receiptHandle)

### `registerTopics`

(credentials, topicNames)

### `registerQueues`

(credentials, queueNames)

### `receiveMessage`

(credentials, maxNumberOfMessages, visibilityTimeout, queueName)

### `subscribeQueuesToTopics`

(credentials, topicNames, queueName, deadLetterQueueName?, maxReceiveCount?)

### `subscribeQueueTopicsByTheirPrefix`

(credentials, topicNames, queueName, deadLetterQueueName?, maxReceiveCount?)

### `publish`

(credentials, topicName, message)

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
