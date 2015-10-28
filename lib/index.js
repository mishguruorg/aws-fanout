import Promise from 'bluebird'
import publishToTopic from './sns/publish'
import { curry, map, compose } from 'ramda'

import setQueuePermissions from './sqs/setQueuePermissions'
import { getSqsUrl } from './sqs/getQueueInfo'
import deleteSqsMessage from './sqs/deleteMessage'
import receiveSqsMessage from './sqs/receiveMessage'

const createTopic = curry(require('./sns/createTopic'))
const createQueue = curry(require('./sqs/createQueue'))
const subscribeSqs = curry(require('./sns/subscribeSqs'))

/**
 * Creates all topics with a list of given names
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {[String]} topics
 * @return {Promise<[{ResponseMetadata: Object, TopicArn: String}]>}
 */
const registerTopics = (credentials, topics) => {
  const authenticatedCreateTopic = createTopic(credentials)
  return compose(
    Promise.all,
    map(authenticatedCreateTopic)
  )(topics)
}

/**
 * Creates all queues with a list of given names
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {[String]} queueNames
 * @return {Promise<[{ResponseMetadata: Object, QueueUrl: String}]>}
 */
const registerQueues = (credentials, queues) => {
  const authenticatedCreateQueue = createQueue(credentials)

  return compose(
    Promise.all,
    map(authenticatedCreateQueue)
  )(queues)
}

/**
 * Allows these topics to write to a specified queue
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials [description]
 * @param  {[String]} topics      [Name of the topics]
 * @param  {String} queue       [Name of the queues]
 * @return {Promise<{ResponseMetadata: Object}>}             [description]
 */
const subscribeQueueToTopics = (credentials, topics, queue) => {
  const subscribeToQueue = subscribeSqs(credentials, queue)

  return setQueuePermissions(credentials, topics, queue)
    .then(res => {
      return compose(
        Promise.all,
        map(subscribeToQueue)
      )(topics)
    })
}

/**
 * Allows these topics to write to a specified queue
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials [description]
 * @param  {[String]} topics      [Name of the topics]
 * @param  {String} queue       [Name of the queues]
 * @return {Promise<{ResponseMetadata: Object}>}             [description]
 */
const deleteMessage = (credentials, queueName, receiptHandle) => {
  return getSqsUrl(credentials, queueName)
    .then(url => deleteSqsMessage(credentials, url, receiptHandle))
}

/**
 * Receive a message from the queue
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials [description]
 * @param  {Number} maxMessages      [How many messages do you want to receive? MAX:10]
 * @param  {Number} visibilityTimeout       [How long before this message goes back onto the queue?]
 * @return {Promise<{ResponseMetadata: Object, Messages: [{MessageId: UUID, ReceiptHandle: String, Body: String}]}>}             [Remember to call JSON.parse on the body]
 */
const receiveMessage = (credentials, maxMessages, visibilityTimeout, queueName) => {
  return getSqsUrl(credentials, queueName)
    .then(url => receiveSqsMessage(credentials, maxMessages, visibilityTimeout, url))
}

const publish = publishToTopic

export {
  deleteMessage,
  receiveMessage,
  registerTopics,
  registerQueues,
  subscribeQueueToTopics,
  publish
}
