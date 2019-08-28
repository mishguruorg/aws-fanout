interface BuildQueuePolicyOptions {
  queueArn: string,
  topicArnList: string[],
}

const buildQueuePolicy = (options: BuildQueuePolicyOptions) => {
  const { queueArn, topicArnList } = options

  const sourceArn = topicArnList.length === 1 ? topicArnList[0] : topicArnList

  return JSON.stringify({
    Version: '2012-10-17',
    Id: `${queueArn}/SQSDefaultPolicy`,
    Statement: [
      {
        Sid: `Sid${Date.now()}`,
        Effect: 'Allow',
        Principal: '*',
        Action: 'SQS:SendMessage',
        Resource: queueArn,
        Condition: {
          ArnEquals: {
            'aws:SourceArn': sourceArn,
          },
        },
      },
    ],
  })
}

export default buildQueuePolicy
