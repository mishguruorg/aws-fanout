/* globals describe, it */
import { expect } from 'chai'
import proxyquire from 'proxyquire'
import Promise from 'bluebird'

describe('when I register a list of topics', () => {
  it('I should get a promise back with a list of all responses', done => {
    const mockedEntry = mockCreateTopicForEntry()

    mockedEntry.registerTopics('region', 'accessKey', 'secret', [
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
  return proxyquire('../../../lib/', {
    './sns/createTopic': (region, accessKey, secret, topic) => Promise.resolve('success')
  })
}
