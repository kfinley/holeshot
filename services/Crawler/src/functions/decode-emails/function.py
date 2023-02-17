#
# This function runs on an SNS message which contains a list of S3 keys. Each file will be opened and any
# encoded email addresses will be decoded then the file will be written back to S3.
#

import sys
import boto3
import os
import json

bucket = os.environ['BUCKET_NAME']
s3 = boto3.client("s3")

# Source: https://stackoverflow.com/a/58111681
def decCFEmail(encodedEmail):
    try:
        email = ''.join([chr(int(encodedEmail[i:i+2], 16) ^ int(encodedEmail[:2],16)) for i in range(2, len(encodedEmail), 2)])
        return email
    except (ValueError):
        pass

def handler(event, lambda_context):

    print(event)
    print(bucket)

    # event.Records[0].Sns.Subject
    message = json.loads(event['Records'][0]['Sns']['Message'])

    print(message)

    for key in message['Keys']:
      print(key)
      trackInfo = json.loads(s3.get_object(Bucket=bucket, Key=key)["Body"].read())
      trackInfo['ContactInfo']['Email'] = decoded_email = decCFEmail(trackInfo['ContactInfo']['Email'])

      print(decoded_email)

      for op in trackInfo['Operators']:
        if (op.__contains__(':')):
          decoded_email = decCFEmail(op.split(':')[1])
          trackInfo['Operators'][trackInfo['Operators'].index(op)] = decoded_email
          print(decoded_email)

      print(trackInfo)

      s3.put_object(Bucket=bucket, Key=key, Body=json.dumps(trackInfo))


    return 'Success'

