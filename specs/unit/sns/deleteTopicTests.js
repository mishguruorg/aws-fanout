/* global describe, it, before, after */
import sinon from 'sinon'
import { expect } from 'chai'
import AWS from 'aws-sdk'
import deleteTopic from '../../../lib/sns/deleteTopic'
import deleteTopicRes from '../../responses/deleteTopic'
import getCredentials from '../../helpers/getCredentials'

describe('deleteTopic()', () => {
  const credentials = getCredentials()

  before(() => mockDeleteTopic(deleteTopicRes))

  it('should remove the topic specified by its ARN', (done) => {
    deleteTopic(credentials, 'arn:aws:sns:us-west-2:488075936769:thisIsATestTopic')
      .then((res) => {
        expect(res).to.exist
        done()
      })
      .catch(done)
  })

  after(() => restoreCreateTopic())
})

const mockDeleteTopic = res => {
  sinon.stub(AWS, 'SNS').callsFake(() => ({
    deleteTopic: (config, cb) => {
      cb(null, res)
    }
  }))
}

const restoreCreateTopic = () => {
  AWS.SNS.restore()
}
