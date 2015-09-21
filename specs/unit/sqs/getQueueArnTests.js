/* global before, describe, it, after */
import sinon from 'sinon'
import { expect } from 'chai'
import AWS from 'aws-sdk'
import getQueueArn from '../../../lib/sqs/getQueueArn'
import getArnResult from '../../responses/getQueueAttributes'
import getCredentials from '../../helpers/getCredentials'

describe('when I get an ARN for a queue', () => {
  before(() => mockGetArn(getArnResult))

  it('it should return me an arn for that queue', function (done) {
    this.timeout(5000)
    getQueueArn(getCredentials(), 'this is a queue url')
      .then(res => {
        expect(res.Attributes.QueueArn).to.be.eq(getArnResult.Attributes.QueueArn)
        done()
      })
      .catch(done)
  })

  after(() => restoreGetArn())
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
