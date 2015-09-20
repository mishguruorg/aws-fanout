import Promise from 'bluebird'
import AwsCredentialError from '../../errors/AwsCredentialError'

const checkAwsCredentials = credentials => {
  let missingCredentials = []

  if (!credentials.region) missingCredentials.push('region')
  if (!credentials.accessKeyId) missingCredentials.push('accessKeyId')
  if (!credentials.secretAccessKey) missingCredentials.push('secretAccessKey')

  if (missingCredentials.length > 0) {
    return Promise.reject(new AwsCredentialError('You are calling the quevents library without aws credentials', missingCredentials, credentials))
  }

  return Promise.resolve()
}
