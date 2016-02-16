import Promise from 'bluebird'
import publishToTopic from './sns/publish'
import { curry, map, compose } from 'ramda'

import setQueuePermissions from './sqs/setQueuePermissions'
import { getSqsUrl } from './sqs/getQueueInfo'
import getSnsArn from './sns/getSnsArn'
import deleteSqsMessage from './sqs/deleteMessage'
import receiveSqsMessage from './sqs/receiveMessage'
import deleteSqsQueue from './sqs/deleteQueue'
import deleteSnsTopic from './sns/deleteTopic'

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
const subscribeQueueToTopics = (credentials, topics, queue, deadLetterQueue, retries) => {
  const subscribeToQueue = subscribeSqs(credentials, queue)

  return setQueuePermissions(credentials, topics, queue, deadLetterQueue, retries)
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

/**
 * Delete a queue specified by the queue name
 * @param {Object} credentials
 * @param {String} credentials.region
 * @param {String} credentials.accessKeyId
 * @param {String} credentials.secretAccessKey
 * @param {String} queueUrl - URL of the queue to delete
 * @returns {Promise<ResponseMetadata: Object>} de-serialized data returned from the request
*/
const deleteQueue = (credentials, queueName) => {
  return getSqsUrl(credentials, queueName)
    .then(queueUrl => deleteSqsQueue(credentials, queueUrl))
}

/**
 * Deletes a topic and all its subscriptions, specified by its ARN
 * @param {Object} credentials
 * @param {String} credentials.region
 * @param {String} credentials.accessKeyId
 * @param {String} credentials.secretAccessKey
 * @param {string} topicArn - ARN of the topic to delete
 * @returns {Promise<{ResponseMetadata: Object}>} de-serialized data returned from the request
 */
const deleteTopic = (credentials, topicName) => {
  return getSnsArn(credentials, topicName)
    .then(topicArn => deleteSnsTopic(credentials, topicArn))
}

const publish = publishToTopic

export {
  deleteQueue,
  deleteTopic,
  deleteMessage,
  receiveMessage,
  registerTopics,
  registerQueues,
  subscribeQueueToTopics,
  publish
}
