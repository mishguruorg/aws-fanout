import Promise from 'bluebird'
import { curry, map, compose } from 'ramda'

const createTopic = curry(require('./sns/createTopic'))
const createQueue = curry(require('./sqs/createQueue'))

const registerTopics = (region, accessKeyId, secretAccessKey, topics) => {
  const authenticatedCreateTopic = createTopic(region, accessKeyId, secretAccessKey)

  return compose(
    Promise.all,
    map(authenticatedCreateTopic)
  )(topics)
}

const registerQueues = (region, accessKeyId, secretAccessKey, queues) => {
  const authenticatedCreateQueue = createQueue(region, accessKeyId, secretAccessKey)

  return compose(
    Promise.all,
    map(authenticatedCreateQueue)
  )(queues)
}

export {
  registerTopics,
  registerQueues
}
