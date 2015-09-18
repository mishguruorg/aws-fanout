/* global before, describe, it, after */
import sinon from 'sinon'
import { expect } from 'chai'
import AWS from 'aws-sdk'
import createQueue from '../../../lib/sqs/createQueue'

describe('when I create a queue on aws', () => {
  const expectedResultFromCreateQueue = {
    ResponseMetadata: {
      RequestId: 'a guid'
    },
    QueueUrl: 'a url'
  }

  before(() => mockCreateQueue(expectedResultFromCreateQueue))
  it('it should accept my credentials and create a queue', function (done) {
    this.timeout(5000)
    createQueue('us-west-2', 'AKIAIPYGFNCRIRVAXIAA', '/mB4/lMeO4FRNPY8GoRvDyDb+4NK6qg/XmokXsOX', 'queueName')
      .then(res => {
        expect(res.QueueUrl).to.be.eq(expectedResultFromCreateQueue.QueueUrl)
        done()
      })
      .catch(done)
  })
  after(() => restoreCreateQueue())
})

const mockCreateQueue = res => {
  sinon.stub(AWS, 'SQS', () => ({
    createQueue: (config, cb) => {
      cb(null, res)
    }
  }))
}

const restoreCreateQueue = () => {
  AWS.SQS.restore()
}
