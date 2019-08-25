interface BuildQueueRedrivePolicyOptions {
  maxReceiveCount: number,
  deadLetterTargetArn: string,
}

const buildQueueRedrivePolicy = (options: BuildQueueRedrivePolicyOptions) => {
  const { maxReceiveCount, deadLetterTargetArn } = options

  return JSON.stringify({
    maxReceiveCount,
    deadLetterTargetArn,
  })
}

export default buildQueueRedrivePolicy
