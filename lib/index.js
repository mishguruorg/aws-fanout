import Promise from 'bluebird'
import { curry, map, compose } from 'ramda'

const createTopic = curry(require('./sns/createTopic'))

const registerTopics = (region, accessKeyId, secretAccessKey, topics) => {
  const authenticatedCreateTopic = createTopic(region, accessKeyId, secretAccessKey)

  return compose(
    Promise.all,
    map(authenticatedCreateTopic)
  )(topics)
}

export {
  registerTopics
}
