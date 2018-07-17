/* globals beforeEach, afterEach, describe, it */
import { expect } from 'chai'
import subscribe from '../../lib/sns/subscribeSqs'
import AWS from 'aws-sdk'
import sinon from 'sinon'
import getCredentials from '../helpers/getCredentials'
import subscribeRes from '../responses/publish'
import createTopicResult from '../responses/createTopic'
import createQueueResult from '../responses/createQueue'
import getQueueAttributesResult from '../responses/getQueueAttributes'

describe('When I subscribe to an SNS Topic', () => {
  beforeEach(() => {
    mockSns(subscribeRes, createTopicResult)
    mockSqs(createQueueResult, getQueueAttributesResult)
  })

  it('I should set up a subscribtion between a queue and a topic', function (done) {
    this.timeout(20000)

    subscribe(getCredentials(), 'thisIsATestQueue', 'thisIsATestTopic')
      .then(res => {
        expect(res.MessageId).to.be.eq(subscribeRes.MessageId)
        done()
      })
      .catch(done)
  })

  afterEach(() => {
    restoreSns()
    restoreSqs()
  })
})

const mockSns = (subres, createTopicRes) => {
  sinon.stub(AWS, 'SNS').callsFake(() => ({
    subscribe: (config, cb) => {
      cb(null, subres)
    },
    createTopic: (config, cb) => {
      cb(null, createTopicRes)
    }
  }))
}

const mockSqs = (createQueueRes, getQueueAttrRes) => {
  sinon.stub(AWS, 'SQS').callsFake(() => ({
    createQueue: (config, cb) => {
      cb(null, createQueueRes)
    },
    getQueueAttributes: (config, cb) => {
      cb(null, getQueueAttrRes)
    }
  }))
}

const restoreSns = () => {
  AWS.SNS.restore()
}

const restoreSqs = () => {
  AWS.SQS.restore()
}
