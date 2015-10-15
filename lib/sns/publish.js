import { SNS } from 'aws-sdk'
import Promise from 'bluebird'
import getSnsArn from './getSnsArn'
import { dissoc } from 'ramda'

const publish = (credentials, readableName, messageJson) => {
  return getSnsArn(credentials, readableName)
    .then(arn => publishToSns(credentials, arn, messageJson))
}

const publishToSns = (credentials, topicArn, messageJson) => {
  const sns = new SNS(credentials)

  return new Promise((resolve, reject) => {
    sns.publish({
      TopicArn: topicArn,
      MessageStructure: 'json',
      Message: JSON.stringify({
        default: messageJson.default,
        APNS: JSON.stringify(dissoc('default', messageJson))
      })
    }, (err, res) => {
      if (err) return reject(err)
      else resolve(res)
    })
  })
}

export default publish
