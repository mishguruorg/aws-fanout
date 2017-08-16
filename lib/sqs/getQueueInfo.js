import createQueue from './createQueue'
import getQueueAttributes from './getQueueAttributes'
import { memoize } from 'ramda'

/**
 * Gets a queue URL
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} queueName
 * @return {Promise<String>}
 */
const getSqsUrl = memoize((credentials, readableName) => (
  createQueue(credentials, readableName)
    .then((res) => res.QueueUrl)
))
/**
 * Gets the ARN for a queue
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} queueName
 * @return {Promise<String>} ARN
 */
const getSqsArn = memoize((credentials, readableName) => (
  getSqsUrl(credentials, readableName)
    .then((url) => getQueueAttributes(credentials, url))
    .then((res) => res.Attributes.QueueArn)
))

/**
 * Gets the ARN and the URL for a queue
 * @param  {{ region: String, accessKeyId: String, secretAccessKey: String}} credentials
 * @param  {String} queueName
 * @return {Promise<{url: String, arn: String}>}
 */
const getAllSqsInfo = memoize((credentials, readableName) => {
  let scope = {}

  return getSqsArn(credentials, readableName)
    .then((arn) => {
      scope.arn = arn
      return getSqsUrl(credentials, readableName)
    })
    .then((url) => ({
      ...scope,
      url
    }))
})

export {
  getAllSqsInfo,
  getSqsArn,
  getSqsUrl
}
