/* global beforeEach, describe, it, afterEach */
import sinon from 'sinon'
import { expect } from 'chai'
import AWS from 'aws-sdk'
import getQueueAttributes from '../../../lib/sqs/getQueueAttributes'
import getArnResult from '../../responses/getQueueAttributes'
import getCredentials from '../../helpers/getCredentials'

describe('when I get an ARN for a queue', () => {
  beforeEach(() => mockGetArn(getArnResult))

  it('it should return me an arn for that queue', function (done) {
    this.timeout(5000)
    getQueueAttributes(getCredentials(), 'this is a queue url')
      .then(res => {
        expect(res.Attributes.QueueArn).to.be.eq(getArnResult.Attributes.QueueArn)
        done()
      })
      .catch(done)
  })

  afterEach(() => restoreGetArn())
})

const mockGetArn = res => {
  sinon.stub(AWS, 'SQS', () => ({
    getQueueAttributes: (config, cb) => {
      cb(null, res)
    }
  }))
}

const restoreGetArn = () => {
  AWS.SQS.restore()
}
