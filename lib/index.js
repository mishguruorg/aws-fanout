import Promise from 'bluebird'
import { curry, map, compose } from 'ramda'

const createTopic = curry(require('./sns/createTopic'))
const createQueue = curry(require('./sqs/createQueue'))

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
 * @param  {[queues]} queueNames
 * @return {Promise<[{ResponseMetadata: Object, QueueUrl: String}]>}
 */
const registerQueues = (credentials, queues) => {
  const authenticatedCreateQueue = createQueue(credentials)

  return compose(
    Promise.all,
    map(authenticatedCreateQueue)
  )(queues)
}

export {
  registerTopics,
  registerQueues
}
