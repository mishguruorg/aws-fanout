import Promise from 'bluebird'
import { curry, map, compose } from 'ramda'

const createTopic = curry(require('./sns/createTopic'))
const createQueue = curry(require('./sqs/createQueue'))

const registerTopics = (credentials, topics) => {
  const authenticatedCreateTopic = createTopic(credentials)

  return compose(
    Promise.all,
    map(authenticatedCreateTopic)
  )(topics)
}

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
