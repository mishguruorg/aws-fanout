/* global describe, it, before */
import { expect } from 'chai'
import createQueue from '../../../lib/sqs/createQueue'
import deleteQueue from '../../../lib/sqs/deleteQueue'
import getCredentials from '../../helpers/getCredentials'

describe('deleteQueue()', () => {
  const credentials = getCredentials()
  let queueUrl

  before((done) => {
    createQueue(credentials, 'testQueue')
      .then((res) => {
        queueUrl = res.QueueUrl
        done()
      })
      .catch(done)
  })

  it('should remove the queue specified by the url', (done) => {
    deleteQueue(credentials, queueUrl)
      .then((res) => {
        expect(res).to.exist
        done()
      })
      .catch(done)
  })
})
