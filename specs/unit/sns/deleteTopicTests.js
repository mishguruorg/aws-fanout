/* global describe, it, before */
import { expect } from 'chai'
import createTopic from '../../../lib/sns/createTopic'
import deleteTopic from '../../../lib/sns/deleteTopic'
import getCredentials from '../../helpers/getCredentials'

describe('deleteTopic()', () => {
  const credentials = getCredentials()
  let topicArn

  before((done) => {
    createTopic(credentials, 'testTopic')
      .then((res) => {
        topicArn = res.TopicArn
        done()
      })
      .catch(done)
  })

  it('should remove the topic specified by its ARN', (done) => {
    deleteTopic(credentials, topicArn)
      .then((res) => {
        expect(res).to.exist
        done()
      })
      .catch(done)
  })
})
