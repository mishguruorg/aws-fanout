/* global beforeEach, describe, it, afterEach */
import sinon from 'sinon'
import { expect } from 'chai'
import AWS from 'aws-sdk'
import deleteMessage from '../../../lib/sqs/deleteMessage'
import deleteMessageRes from '../../responses/deleteMessage'
import getCredentials from '../../helpers/getCredentials'

describe('when I delete a queue message on aws', () => {
  beforeEach(() => mockSqs(deleteMessageRes))
  it('it should remove a message from the queue', function (done) {
    this.timeout(10000)
    deleteMessage(getCredentials(), 'https://sqs.us-west-2.amazonaws.com/488075936769/thisIsATestQueue', 'AQEBTDDt8s4VyY/2PhumZQN4gUlrfOJl455SGag44Bm/9dt6lFSe1rOgckklig9otuVFMhv6PDvByzn9/Xn5IPMv8DYYBq2gY8Xrkr7i7e/owpRQ+XThfsUywYA9gdY+J2PRIQPYvVAtYt9gcuPgshdrltQv7LxWvg9Y4c5z3WnkvJ6b1TP3bH54wKCQkpElE2JPemB3UEyxC7b4Xv+8N2zbzl3S2P7Y/36lBQIIzbudYCDZ7mDBWtufXmbTzPy9Fs/wKt4NWE+FjVBZBUx8qCDqcTOBcGoQUgun935xQINXa2OcE9INYUeC8bYS3PJyFYKtWVPR6/T45PtIpVjLQr2IwY6tqPy8HnQxrpHOyFFNYmE=')
      .then(res => {
        expect(res.ResponseMetadata.MessageId).to.be.eq(deleteMessageRes.ResponseMetadata.MessageId)
        done()
      })
      .catch(done)
  })
  afterEach(() => restoreSqs())
})

const mockSqs = res => {
  sinon.stub(AWS, 'SQS', () => ({
    deleteMessage: (config, cb) => {
      cb(null, res)
    }
  }))
}

const restoreSqs = () => {
  AWS.SQS.restore()
}
