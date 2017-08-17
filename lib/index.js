import Promise from 'bluebird'
import { curry, map, compose } from 'ramda'

import buildTopicPrefix from './sns/buildTopicPrefix'
import createTopic from './sns/createTopic'
import deleteSnsTopic from './sns/deleteTopic'
import getSnsArn from './sns/getSnsArn'
import publishToTopic from './sns/publish'
import { subscribeTopics } from './sns/subscribeSqs'

import buildTopicArnList from './sqs/buildTopicArnList'
import createQueue from './sqs/createQueue'
import deleteSqsMessage from './sqs/deleteMessage'
import deleteSqsQueue from './sqs/deleteQueue'
import receiveSqsMessage from './sqs/receiveMessage'
import { getSqsUrl, getAllSqsInfo } from './sqs/getQueueInfo'
import setQueuePermissions from './sqs/setQueuePermissions'

const curriedCreateTopic = curry(createTopic)
const curriedCreateQueue = curry(createQueue)

/**
 * Creates all topics with a list of given names
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {[String]} topics
 * @return {Promise<[{ResponseMetadata: Object, TopicArn: String}]>}
 */
const registerTopics = (credentials, topics) => {
  const authenticatedCreateTopic = curriedCreateTopic(credentials)
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
  const authenticatedCreateQueue = curriedCreateQueue(credentials)

  return compose(
    Promise.all,
    map(authenticatedCreateQueue)
  )(queues)
}

/**
 * Take a list of generic topic names and the name of a queue. Identify the arn of each, set permssions
 * on the queue and subscribe the topics to be sent to this queue.
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials [description]
 * @param  {[String]} topicNames List of generic topic names
 * @param  {String} queueName generic name of the queue
 * @param  {String} deadLetterQueue generic name of the dead letter queue
 * @return {Promise<{ResponseMetadata: Object}>}
 */
const subscribeQueueToTopics = async (credentials, topicNames, queueName, deadLetterQueue, retries) => {
  const queueInfo = await getAllSqsInfo(credentials, queueName)
  const topicArnList = await buildTopicArnList(credentials, topicNames, queueInfo)

  await setQueuePermissions(credentials, topicArnList, queueInfo, deadLetterQueue, retries)

  return subscribeTopics(credentials, queueInfo.arn, topicArnList)
}

/**
 * Take a list of generic topics, resolve their ARN, find the common prefix of these ARN strings
 * and then allow all topics that satisfy this prefix onto the given queue.
 * All provided topics will be subscribed to the given queue.
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials [description]
 * @param  {[String]} topicNames List of generic topic names
 * @param  {String} queueName generic name of the queue
 * @param  {String} deadLetterQueue generic name of the dead letter queue
 * @return {Promise<{ResponseMetadata: Object}>}
 */
const subscribeQueueTopicsByTheirPrefix = async (credentials, topicNames, queueName, deadLetterQueue, retries) => {
  const queueInfo = await getAllSqsInfo(credentials, queueName)
  const topicArnList = await buildTopicArnList(credentials, topicNames, queueInfo)
  const topicPrefix = buildTopicPrefix(topicArnList)

  await setQueuePermissions(credentials, [topicPrefix], queueInfo, deadLetterQueue, retries)

  return subscribeTopics(credentials, queueInfo.arn, topicArnList)
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
    .then((url) => deleteSqsMessage(credentials, url, receiptHandle))
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
    .then((url) => receiveSqsMessage(credentials, maxMessages, visibilityTimeout, url))
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
    .then((queueUrl) => deleteSqsQueue(credentials, queueUrl))
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
    .then((topicArn) => deleteSnsTopic(credentials, topicArn))
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
  subscribeQueueTopicsByTheirPrefix,
  publish
}
