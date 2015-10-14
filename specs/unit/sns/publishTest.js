/* globals beforeEach, afterEach, describe, it */
import { expect } from 'chai'
import { publish } from '../../../lib/'
import AWS from 'aws-sdk'
import sinon from 'sinon'
import getCredentials from '../../helpers/getCredentials'
import publishRes from '../../responses/publish'
import createTopicResult from '../../responses/createTopic'

describe('When I publish to an SNS Topic', () => {
  beforeEach(() => {
    mockPublish(publishRes, createTopicResult)
  })

  it('I should push an item into the topic', function (done) {
    this.timeout(8000)

    publish(getCredentials(), 'thisIsATestTopic', {
      default: 'I am a default message',
      foo: 'This is a foo',
      bar: 9,
      moreThings: 'Here are some more things'
    })
      .then(res => {
        expect(res.MessageId).to.be.eq(publishRes.MessageId)
        done()
      })
      .catch(done)
  })

  afterEach(() => {
    restorePublish()
  })
})

const mockPublish = (pubres, createTopicRes) => {
  sinon.stub(AWS, 'SNS', () => ({
    publish: (config, cb) => {
      cb(null, pubres)
    },
    createTopic: (config, cb) => {
      cb(null, createTopicRes)
    }
  }))
}

const restorePublish = () => {
  AWS.SNS.restore()
}
