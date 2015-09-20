class AwsCredentialError extends Error {
  constructor (message, missingFields, credentials) {
    super(message)
    this.missingFields = missingFields
    this.credentials = credentials
  }
}

export default AwsCredentialError
