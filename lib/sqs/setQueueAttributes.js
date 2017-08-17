import { SQS } from 'aws-sdk'
import Promise from 'bluebird'

const setQueueAttributes = (credentials, queueUrl, attributes, redrivePolicy) => {
  const awsParams = {
    QueueUrl: queueUrl,
    Attributes: {
      Policy: JSON.stringify(attributes)
    }
  }

  if (redrivePolicy) {
    awsParams.Attributes.RedrivePolicy = JSON.stringify(redrivePolicy)
  }

  return invoke(credentials, awsParams)
}

const invoke = (credentials, awsParams) => {
  return new Promise((resolve, reject) => {
    const sqs = new SQS(credentials)
    sqs.setQueueAttributes(awsParams, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default setQueueAttributes
