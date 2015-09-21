/* global describe, it */
import setQueuePermissions from '../../../lib/sqs/setQueuePermissions'
import getCredentials from '../../helpers/getCredentials'

describe('when I set permissions for a queue', () => {
  it('It should give my SNS topic permissions to write to that queue', function (done) {
    this.timeout(4000)
    setQueuePermissions(getCredentials(), 'thisIsATestTopic', 'thisIsATestQueue')
      .then(res => {
        console.log(res)
        done()
      })
  })
})
