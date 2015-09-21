/* global describe, it */
import proxyquire from 'proxyquire'
import { expect } from 'chai'
import createQueueResult from '../../responses/createQueue'
import getQueueAttributesResult from '../../responses/getQueueAttributes'
import getCredentials from '../../helpers/getCredentials'

const getLibraryWithMock = (createQueueRes, getQueueAttrRes) => (
  proxyquire('../../../lib/sqs/getQueueInfo', {
    './createQueue': () => Promise.resolve(createQueueRes),
    './getQueueArn': () => Promise.resolve(getQueueAttrRes)
  })
)

describe('when I get an arn for a topic', () => {
  const getQueueInfo = getLibraryWithMock(createQueueResult, getQueueAttributesResult)

  it('it should accept my credentials and return me an arn', done => {
    getQueueInfo.getAllSqsInfo(getCredentials(), 'thisIsATestTopic')
      .then(res => {
        expect(res.url).to.be.eq(createQueueResult.QueueUrl, getQueueAttributesResult.Attributes.QueueArn)
        done()
      })
      .catch(done)
  })
})
