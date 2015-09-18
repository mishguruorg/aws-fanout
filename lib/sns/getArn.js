import createTopic from '../sns/createTopic'
import Promise from 'bluebird'

let snsCache = {}

const getSnsArn = (region, accessKeyId, secretAccessKey, readableName) => {
  const cachedArn = snsCache[readableName]
  if (cachedArn) {
    return Promise.resolve(cachedArn)
  }

  return createTopic(region, accessKeyId, secretAccessKey, readableName)
    .then(res => {
      snsCache[readableName] = res.TopicArn

      return res.TopicArn
    })
}

export default getSnsArn
