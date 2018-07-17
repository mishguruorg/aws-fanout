/* global beforeEach, describe, it, afterEach */
import sinon from 'sinon'
import { expect } from 'chai'
import AWS from 'aws-sdk'
import getQueueAttributes from '../../../lib/sqs/getQueueAttributes'
import getArnResult from '../../responses/getQueueAttributes'
import getCredentials from '../../helpers/getCredentials'

describe('when I get attributes for a Queue', () => {
  beforeEach(() => mockGetArn(getArnResult))

  it('it should return me all attributes for that queue', function (done) {
    this.timeout(5000)
    getQueueAttributes(getCredentials(), 'https://sqs.us-west-2.amazonaws.com/488075936769/thisIsATestQueue')
      .then(res => {
        expect(res.Attributes.QueueArn).to.be.eq(getArnResult.Attributes.QueueArn)
        done()
      })
      .catch(done)
  })

  afterEach(() => restoreGetArn())
})

const mockGetArn = res => {
  sinon.stub(AWS, 'SQS').callsFake(() => ({
    getQueueAttributes: (config, cb) => {
      cb(null, res)
    }
  }))
}

const restoreGetArn = () => {
  AWS.SQS.restore()
}
