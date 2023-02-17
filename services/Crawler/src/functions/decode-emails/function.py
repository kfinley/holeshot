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

    for key in message.Keys:
      print(key)

    # file_content = json.loads(s3_client.get_object(
    #         Bucket=S3_BUCKET, Key=s3_file["Key"])["Body"].read())
    #     print(file_content)

    # obj = s3.Object(event.BucketName, event.Key)
    # data = json.load(obj.get()['Body'])
    return 'Success'

