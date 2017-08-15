/* global describe, it */
import proxyquire from 'proxyquire'
import { expect } from 'chai'
import createTopicResult from '../../responses/createTopic'
import getCredentials from '../../helpers/getCredentials'

const getLibraryWithMock = createTopicResultMock => (
  proxyquire.noPreserveCache().noCallThru()('../../../lib/sns/getSnsArn', {
    '../sns/createTopic': () => Promise.resolve(createTopicResultMock)
  }).default
)

describe('when I get an arn for a topic', () => {
  const getArn = getLibraryWithMock(createTopicResult)

  it('it should accept my credentials and return me an arn', done => {
    getArn(getCredentials(), 'thisIsATestTopic')
      .then(res => {
        expect(res).to.be.eq(createTopicResult.TopicArn)
        done()
      })
      .catch(done)
  })
})
