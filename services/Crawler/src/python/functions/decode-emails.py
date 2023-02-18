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

    message = json.loads(event['Records'][0]['Sns']['Message'])

    for key in message['Keys']:
      trackInfo = json.loads(s3.get_object(Bucket=bucket, Key=key)["Body"].read())
      trackInfo['ContactInfo']['Email'] = decCFEmail(trackInfo['ContactInfo']['Email'])

      for op in trackInfo['Operators']:
        if (op.__contains__(':')):
          trackInfo['Operators'][trackInfo['Operators'].index(op)] = decCFEmail(op.split(':')[1])

      s3.put_object(Bucket=bucket, Key=key, Body=json.dumps(trackInfo))

    snsResponse = sns.publish(
      TopicArn = topic_arn,
      Subject = 'Crawler/decodeEmails',
      Message = json.dumps({
        'Keys': message['Keys']
      })
    )

    return {
        'statusCode': 200,
        'body': json.dumps(
          {'Success': True,
          'MessageId': snsResponse.MessageId
          })
    }
