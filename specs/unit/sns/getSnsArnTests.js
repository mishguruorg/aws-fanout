/* global before, describe, it, after */
import proxyquire from 'proxyquire'
import { expect } from 'chai'
import AWS from 'aws-sdk'

const getLibraryWithMock = createTopicResult => (
  proxyquire('../../../lib/sns/getSnsArn', {
    '../sns/createTopic': () => Promise.resolve(createTopicResult)
  })
)

describe('when I get an arn for a topic', () => {
  const createTopicMock = {
    ResponseMetadata: {
      RequestId: 'a guid'
    },
    TopicArn: 'Ahll be bahck'
  }

  const getArn = getLibraryWithMock(createTopicMock)

  const credentials = {
    region: 'us-west-2',
    accessKeyId: 'AKIAIPYGFNCRIRVAXIAA',
    secretAccessKey: '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'
  }

  it('it should accept my credentials and return me an arn', done => {
    getArn(credentials, 'thisIsATestTopic')
      .then(res => {
        expect(res).to.be.eq(createTopicMock.TopicArn)
        done()
      })
      .catch(done)
  })
})
