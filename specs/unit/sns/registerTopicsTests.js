/* globals describe, it */
import { expect } from 'chai'
import proxyquire from 'proxyquire'
import Promise from 'bluebird'
import createTopicResult from '../../responses/createTopic'
import getCredentials from '../../helpers/getCredentials'

describe('when I register a list of topics', () => {
  it('I should get a promise back with a list of all responses', done => {
    const mockedEntry = mockCreateTopicForEntry()

    mockedEntry.registerTopics(getCredentials(), [
      'this is a topic',
      'this is another topic'
    ])
      .then(responses => {
        expect(responses.length).to.be.eq(2)
        done()
      })
      .catch(done)
  })
})

const mockCreateTopicForEntry = () => {
  return proxyquire.noPreserveCache().noCallThru()('../../../lib/', {
    './sns/createTopic': (credentials, topic) => {
      return Promise.resolve(createTopicResult)
    }
  })
}
