/* global describe, it, beforeEach, afterEach */
import getCredentials from '../../helpers/getCredentials'
import { expect } from 'chai'
import proxyquire from 'proxyquire'
import setQueueAttributesRes from '../../responses/setQueueAttributes.json'
import createQueueRes from '../../responses/createQueue.json'
import getQueueAttrRes from '../../responses/getQueueAttributes.json'
import createTopicRes from '../../responses/createTopic.json'
import sinon from 'sinon'
import AWS from 'aws-sdk'

describe('when I set permissions for a queue', () => {
  beforeEach(() => {
    createMockQueueAttr(createQueueRes.QueueUrl, setQueueAttributesRes)
  })

  it('It should give my SNS topic permissions to write to that queue', function (done) {
    this.timeout(10000)
    const setQueuePermissions = getLibraryWithMock(createTopicRes.TopicArn, createQueueRes.QueueUrl, getQueueAttrRes.Attributes.QueueArn, getQueueAttrRes)

    setQueuePermissions(getCredentials(), ['thisIsATestTopic'], 'thisIsATestQueue', 'thisIsADeadLetterQueue')
      .then(res => {
        expect(res).to.be.eq(setQueueAttributesRes)
        done()
      })
      .catch(done)
  })

  afterEach(() => {
    restoreMockQueueAttr()
  })
})

const getLibraryWithMock = (topicArn, sqsUrl, sqsArn, queueAttributes) => (
  proxyquire.noPreserveCache().noCallThru()('../../../lib/sqs/setQueuePermissions', {
    '../sns/getSnsArn': () => Promise.resolve(topicArn),
    './getQueueInfo': {
      getAllSqsInfo: () => Promise.resolve({
        url: sqsUrl,
        arn: sqsArn
      })
    },
    './getQueueAttributes': () => Promise.resolve(queueAttributes)
  }).default
)

const createMockQueueAttr = (queueUrl, res) => {
  sinon.stub(AWS, 'SQS', () => ({
    setQueueAttributes: (config, cb) => {
      if (config.QueueUrl !== queueUrl) {
        throw new Error(`Test Queue Urls do not match ${config.queueUrl} AND ${queueUrl}`)
      }

      if (!JSON.parse(config.Attributes.Policy)) {
        throw new Error(`Something went wrong with the Policy in setQueuePermissions ${JSON.stringify(config.Attributes, null, 3)}`)
      }
      cb(null, res)
    }
  }))
}

const restoreMockQueueAttr = () => {
  AWS.SQS.restore()
}
