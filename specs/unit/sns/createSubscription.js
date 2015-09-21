/* global before, describe, it, after */
import proxyquire from 'proxyquire'
import { expect } from 'chai'
import AWS from 'aws-sdk'
import createSubscription from '../../../lib/sns/createSubscription'

// const getLibraryWithMock = createTopicResult => (
//   proxyquire('../../../lib/sns/getSnsArn', {
//     '../sns/createTopic': () => Promise.resolve(createTopicResult)
//   })
// )

describe('When I create a subscription on an sns Topic', () => {
  const createTopicMock = {
    ResponseMetadata: {
      RequestId: 'a guid'
    },
    TopicArn: 'Ahll be bahck'
  }

  // const getArn = getLibraryWithMock(createTopicMock)

  const credentials = {
    region: 'us-west-2',
    accessKeyId: 'AKIAIPYGFNCRIRVAXIAA',
    secretAccessKey: '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'
  }

  it('it should respond with a request Id', done => {
    createSubscription(credentials, )
      .then(res => {
        expect(res).to.be.eq(createTopicMock.TopicArn)
        done()
      })
      .catch(done)
  })
})
