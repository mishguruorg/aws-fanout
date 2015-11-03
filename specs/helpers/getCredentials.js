const getCredentials = () => {
  return {
    region: process.env.AWS_REGION || 'fake-region',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fake-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fake-secret'
  }
}

export default getCredentials
