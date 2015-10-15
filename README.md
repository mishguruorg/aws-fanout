# AWS-Fanout

A library wrapping SNS and SQS to allow for human readable names when using a fanout technique. Let's you use the fanout pattern without needing to hard code ARNS throughout your application.

## Installation

This module is installed via npm:

``` bash
$ npm install aws-fanout
```

## Example Usage

``` js
import { publish } from 'aws-fanout'

publish(creds, 'newUserHasSignedUp', {
  twitterHandle: '@jladuval',
  userId: 1,
  username: 'Jacob Duval'
})
  .then(res => res.MessageId)
  .catch(err => console.error(err.stack))
```

Library is immature at the moment, suggestions welcome.
