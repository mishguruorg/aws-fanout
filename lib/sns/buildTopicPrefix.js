import findCommonPrefix from 'common-prefix'

const buildTopicPrefix = (topicList) => {
  const common = findCommonPrefix(topicList)

  return `${common}*`
}

export default buildTopicPrefix
