#
# This function runs on an SNS message which contains a list of S3 keys. Each file will be opened and any
# encoded email addresses will be decoded then the file will be written back to S3.
#

import sys
import boto3
import os
import json

bucket = os.environ['BUCKET_NAME']
topic_arn = os.environ['DECODE_EMAILS_TOPIC_ARN']

s3 = boto3.client("s3")
sns = boto3.client('sns')

# Source: https://stackoverflow.com/a/58111681
def decCFEmail(encodedEmail):
    try:
        email = ''.join([chr(int(encodedEmail[i:i+2], 16) ^ int(encodedEmail[:2],16)) for i in range(2, len(encodedEmail), 2)])
        return email
    except (ValueError):
        pass

def handler(event, lambda_context):

    message = json.loads(event['Records'][0]['Sns']['Message'])

    for key in message['Keys']:
      trackInfo = json.loads(s3.get_object(Bucket=bucket, Key=key)["Body"].read())
      trackInfo['ContactInfo']['Email'] = decCFEmail(trackInfo['ContactInfo']['Email'])

      for op in trackInfo['Operators']:
        if (op.__contains__(':')):
          trackInfo['Operators'][trackInfo['Operators'].index(op)] = decCFEmail(op.split(':')[1])

      s3.put_object(Bucket=bucket, Key=key, Body=json.dumps(trackInfo))

    snsTopic = sns.Topic(topic_arn)

    snsResponse = sns.publish_message(snsTopic,
      json.dumps({
        'Keys': message['Keys']
      })
    )

    print(snsResponse)

    return {
        'statusCode': 200,
        'body': json.dumps('Success')
    }
