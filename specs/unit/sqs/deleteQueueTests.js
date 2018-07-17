/* global describe, it, beforeEach, afterEach */
import sinon from 'sinon'
import { expect } from 'chai'
import AWS from 'aws-sdk'
import deleteQueue from '../../../lib/sqs/deleteQueue'
import deleteQueueRes from '../../responses/deleteQueue'
import getCredentials from '../../helpers/getCredentials'

describe('deleteQueue()', () => {
  const credentials = getCredentials()

  beforeEach(() => mockSqs(deleteQueueRes))

  it('should remove the queue specified by the url', (done) => {
    deleteQueue(credentials, 'https://sqs.us-west-2.amazonaws.com/488075936769/thisIsATestQueue')
      .then((res) => {
        expect(res).to.exist
        done()
      })
      .catch(done)
  })

  afterEach(() => restoreSqs())
})

const mockSqs = res => {
  sinon.stub(AWS, 'SQS').callsFake(() => ({
    deleteQueue: (config, cb) => {
      cb(null, res)
    }
  }))
}

const restoreSqs = () => {
  AWS.SQS.restore()
}
