/* global before, describe, it, after */
import sinon from 'sinon'
import { expect } from 'chai'
import AWS from 'aws-sdk'
import createQueue from '../../../lib/sqs/createQueue'
import createQueueResponse from '../../responses/createQueue'
import getCredentials from '../../helpers/getCredentials'

describe('when I create a queue on aws', () => {
  before(() => mockCreateQueue(createQueueResponse))
  it('it should accept my credentials and create a queue', function (done) {
    this.timeout(5000)
    createQueue(getCredentials(), 'thisIsATestQueue')
      .then(res => {
        expect(res.QueueUrl).to.be.eq(createQueueResponse.QueueUrl)
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
