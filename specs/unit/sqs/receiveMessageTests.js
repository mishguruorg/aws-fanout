/* global beforeEach, describe, it, afterEach */
import sinon from 'sinon'
import { expect } from 'chai'
import AWS from 'aws-sdk'
import receiveMessage from '../../../lib/sqs/receiveMessage'
import receiveMessageResponse from '../../responses/receiveMessage'
import getCredentials from '../../helpers/getCredentials'

describe('when I receive a queue message on aws', () => {
  beforeEach(() => mockSqs(receiveMessageResponse))
  it('it should grab a message from the queue', function (done) {
    this.timeout(20000)
    receiveMessage(getCredentials(), 1, 10, 'https://sqs.us-west-2.amazonaws.com/488075936769/thisIsATestQueue')
      .then(res => {
        expect(res.Messages).to.be.eq(receiveMessageResponse.Messages)
        done()
      })
      .catch(done)
  })
  afterEach(() => restoreSqs())
})

const mockSqs = res => {
  sinon.stub(AWS, 'SQS').callsFake(() => ({
    receiveMessage: (config, cb) => {
      cb(null, res)
    }
  }))
}

const restoreSqs = () => {
  AWS.SQS.restore()
}
