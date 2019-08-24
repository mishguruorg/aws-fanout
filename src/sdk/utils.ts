import Bottleneck from 'bottleneck'

import { AWS_FANOUT_RATE_LIMIT_MS } from '../constants'

interface ConfigWithAccessKeyId {
  config: {
    accessKeyId?: string,
  },
}

const cacheKey = (sdk: ConfigWithAccessKeyId, ...args: any[]) => {
  return sdk.config.accessKeyId + JSON.stringify(args)
}

const bottleneck = new Bottleneck({
  minTime: AWS_FANOUT_RATE_LIMIT_MS,
})

const schedule = bottleneck.schedule.bind(bottleneck)

export { schedule, cacheKey }
