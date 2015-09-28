// /* global describe, before, after, it */
// import { expect } from 'chai'
// import AWS from 'aws-sdk'
// import sinon from 'sinon'
// import getCredentials from '../helpers/getCredentials'
// import createSubscription from '../../lib/sns/createSubscription'
// import createQueueResponse from '../responses/createQueue'
// import createTopicResponse from '../responses/createTopic'
// import getQueueAttributesResponse from '../responses/getQueueAttributes'
// import subscribeToSnsResponse from '../responses/subscribeToSns'
//
// describe('When I create a subscription on an sns Topic', () => {
//   let sandbox = sinon.sandbox.create()
//
//   before(() => {
//     mockSqs(sandbox, getQueueAttributesResponse, createQueueResponse)
//     mockSns(sandbox, createTopicResponse, subscribeToSnsResponse, getQueueAttributesResponse)
//   })
//
//   it('it should respond with a request Id', function (done) {
//     this.timeout(10000)
//
//     createSubscription(getCredentials, 'thisIsATestTopic', 'thisIsATestQueue')
//       .then(res => {
//         expect(res.SubscriptionArn).to.be.eq(subscribeToSnsResponse.SubscriptionArn)
//         done()
//       })
//       .catch(done)
//   })
//
//   after(() => {
//     AWS.SQS.restore()
//     AWS.SNS.restore()
//   })
// })
//
// const mockSqs = (sandbox, getQueueAttributesres, createQueueRes) => {
//   AWS.SQS = sandbox.stub().returns({
//     getQueueAttributes: (config, cb) => {
//       cb(null, getQueueAttributesres)
//     },
//     createQueue: (config, cb) => {
//       cb(null, createQueueRes)
//     }
//   })
// }
//
// const mockSns = (sandbox, createTopicRes, subscribeRes, queueArnRes) => {
//   AWS.SNS = sandbox.stub().returns({
//     createTopic: (config, cb) => {
//       cb(null, createTopicRes)
//     },
//     subscribe: (config, cb) => {
//       if (config.TopicArn !== createTopicRes.TopicArn) throw new Error(`This TopicArn does not match ${JSON.stringify(config)}`)
//       if (config.Endpoint !== queueArnRes.Attributes.QueueArn) throw new Error(`This QueueArn does not match ${JSON.stringify(config)}`)
//
//       cb(null, subscribeRes)
//     }
//   })
// }
