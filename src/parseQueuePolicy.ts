interface Policy {
  Statement: {
    Action: string,
    Condition: {
      ArnEquals: {
        'aws:SourceArn': string[] | string,
      },
    },
  }[],
}

const parseQueuePolicy = (policyString: string): string[] => {
  if (typeof policyString !== 'string') {
    return []
  }

  let policy: Policy = null
  try {
    policy = JSON.parse(policyString)
  } catch {
    return []
  }

  if (policy == null || Array.isArray(policy.Statement) === false) {
    return []
  }

  const sendMessageStatements = policy.Statement.filter((item) => {
    return item.Action === 'SQS:SendMessage'
  })

  const topicArns = sendMessageStatements
    .map((item) => {
      if (item.Condition == null || item.Condition.ArnEquals == null) {
        return []
      }
      const sourceArn = item.Condition.ArnEquals['aws:SourceArn']
      return sourceArn
    })
    .flat()
    .filter((arn) => {
      return typeof arn === 'string'
    })

  return topicArns
}

export default parseQueuePolicy
