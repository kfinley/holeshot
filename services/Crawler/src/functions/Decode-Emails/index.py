import sys
from boto3 import client

s3 = boto3.resource('s3')

# Source: https://stackoverflow.com/a/58111681
def decCFEmail(encodedEmail):
    try:
        email = ''.join([chr(int(encodedEmail[i:i+2], 16) ^ int(encodedEmail[:2],16)) for i in range(2, len(encodedEmail), 2)])
        return email
    except (ValueError):
        pass

def handler(event, lambda_context):
    print(event)

    # obj = s3.Object(event.BucketName, event.Key)
    # data = json.load(obj.get()['Body'])
    return 'Success'

