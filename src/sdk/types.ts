import { SQS, SNS } from 'aws-sdk'

export type Credentials = SQS.Types.ClientConfiguration &
SNS.Types.ClientConfiguration
