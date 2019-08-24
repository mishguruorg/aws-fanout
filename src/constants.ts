export const AWS_FANOUT_RATE_LIMIT_MS =
  process.env.AWS_FANOUT_RATE_LIMIT_MS != null
    ? parseInt(process.env.AWS_FANOUT_RATE_LIMIT_MS, 10)
    : 10
