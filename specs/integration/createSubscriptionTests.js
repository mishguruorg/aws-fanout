/* global describe, before, after, it */
import { expect } from 'chai'
import AWS from 'aws-sdk'
import sinon from 'sinon'
import getCredentials from '../helpers/getCredentials'
import createSubscription from '../../lib/sns/createSubscription'
import createQueueResponse from '../responses/createQueue'
import createTopicResponse from '../responses/createTopic'
import getQueueAttributesResponse from '../responses/getQueueAttributes'
import subscribeToSnsResponse from '../responses/subscribeToSns'

describe('When I create a subscription on an sns Topic', () => {
  before(() => {
    mockSqs(getQueueAttributesResponse, createQueueResponse)
    mockSns(createTopicResponse, subscribeToSnsResponse, getQueueAttributesResponse)
  })
  it('it should respond with a request Id', function (done) {
    this.timeout(10000)

    createSubscription(getCredentials, 'thisIsATestTopic', 'thisIsATestQueue')
      .then(res => {
        expect(res.SubscriptionArn).to.be.eq(subscribeToSnsResponse.SubscriptionArn)
        done()
      })
      .catch(done)
  })

  after(() => {
    restoreSns()
    restoreSqs()
  })
})

const mockSqs = (getQueueAttributesres, createQueueRes) => {
  sinon.stub(AWS, 'SQS', () => ({
    getQueueAttributes: (config, cb) => {
      cb(null, getQueueAttributesres)
    },
    createQueue: (config, cb) => {
      cb(null, createQueueRes)
    }
  }))
}

const restoreSqs = () => {
  AWS.SQS.restore()
}

const mockSns = (createTopicRes, subscribeRes, queueArnRes) => {
  sinon.stub(AWS, 'SNS', () => ({
    createTopic: (config, cb) => {
      cb(null, createTopicRes)
    },
    subscribe: (config, cb) => {
      if (config.TopicArn !== createTopicRes.TopicArn) throw new Error(`This TopicArn does not match ${JSON.stringify(config)}`)
      if (config.Endpoint !== queueArnRes.Attributes.QueueArn) throw new Error(`This QueueArn does not match ${JSON.stringify(config)}`)

      cb(null, subscribeRes)
    }
  }))
}

const restoreSns = () => {
  AWS.SNS.restore()
}
