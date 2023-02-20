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

    #
    # This function decodes cloudflare encoded email strings.
    # When GetTracksForRegion is finished it publishes an SNS message with a list of
    # S3 keys. These keys are TrackInfo.json files with encoded emails scraped from the web.
    # The decCFEmail function decodes these emails. Then we write the file back to S3 and
    # send an SNS message notifying that emails have been decoded adn the file is ready to
    # process.
    #

    print(event)
    message = json.loads(event['Records'][0]['Sns']['Message'])

    for key in message['keys']:
      trackInfo = json.loads(s3.get_object(Bucket=bucket, Key=key)["Body"].read())
      trackInfo['contactInfo']['email'] = decCFEmail(trackInfo['contactInfo']['email'])

      for op in trackInfo['operators']:
        if (op.__contains__(':')): # Encoded emails in operators list will be in the format EncodedEmail:xxxxxxxxxxxxxxxxxxxxxxxxxxxx
          trackInfo['operators'][trackInfo['operators'].index(op)] = decCFEmail(op.split(':')[1])

      s3.put_object(Bucket=bucket, Key=key, Body=json.dumps(trackInfo, ensure_ascii=False).encode('utf-8'))

    snsResponse = sns.publish(
      TopicArn = topic_arn,
      Subject = 'Crawler/decodeEmails',
      Message = json.dumps({
        'keys': message['keys']
      })
    )

    return {
        'statusCode': 200,
        'body': json.dumps(
          {
            'Success': True,
            'snsResponse': json.dumps(snsResponse)
          })
    }
