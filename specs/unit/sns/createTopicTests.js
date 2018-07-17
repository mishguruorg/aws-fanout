/* global before, describe, it, after */
import sinon from 'sinon'
import { expect } from 'chai'
import AWS from 'aws-sdk'
import createTopic from '../../../lib/sns/createTopic'
import getCredentials from '../../helpers/getCredentials'
import createTopicResult from '../../responses/createTopic'

describe('when I create a topic on aws', () => {
  before(() => mockCreateTopic(createTopicResult))

  it('it should accept my credentials and create a topic', done => {
    createTopic(getCredentials, 'thisIsATestTopic')
      .then(res => {
        expect(res.TopicArn).to.be.eq(createTopicResult.TopicArn)
        done()
      })
      .catch(done)
  })

  after(() => restoreCreateTopic())
})

const mockCreateTopic = res => {
  sinon.stub(AWS, 'SNS').callsFake(() => ({
    createTopic: (config, cb) => {
      cb(null, res)
    }
  }))
}

const restoreCreateTopic = () => {
  AWS.SNS.restore()
}
