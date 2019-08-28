import { SQS, SNS } from 'aws-sdk'
import mem from 'mem'

import { Credentials } from './types'

const forceWithCredentials = (credentials: Credentials) => {
  return {
    sns: new SNS(credentials),
    sqs: new SQS(credentials),
  }
}

const withCredentials = mem<[Credentials], { sns: SNS, sqs: SQS }, string>(
  forceWithCredentials,
)

export { withCredentials }
