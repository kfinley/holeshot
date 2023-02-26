import os
import json
from functions.aws_resources import s3, sns

# Source: https://stackoverflow.com/a/58111681


def decCFEmail(encodedEmail):

    try:
        email = ''.join([chr(int(encodedEmail[i:i+2], 16) ^ int(encodedEmail[:2], 16))
                        for i in range(2, len(encodedEmail), 2)])
        return email
    except (ValueError):
        pass


def replace_encoded_emails(trackInfo):

    trackInfo['contactInfo']['email'] = decCFEmail(
        trackInfo['contactInfo']['email'])

    for op in trackInfo['operators']:
        if (op.__contains__(':')):  # Encoded emails in operators list will be in the format EncodedEmail:xxxxxxxxxxxxxxxxxxxxxxxxxxxx
            trackInfo['operators'][trackInfo['operators'].index(
                op)] = decCFEmail(op.split(':')[1])

    return json.dumps(trackInfo, ensure_ascii=False)


def process(key):

    #
    # This function decodes cloudflare encoded email strings.
    # When GetTracksForRegion is finished it publishes an SNS message with a list of
    # S3 keys. These keys are TrackInfo.json files with encoded emails scraped from the web.
    # The decCFEmail function decodes these emails. Then we write the file back to S3 and
    # send an SNS message notifying that emails have been decoded adn the file is ready to
    # process.
    #

    # topic_arn = os.environ['DECODE_EMAILS_TOPIC_ARN']
    bucket = os.environ['BUCKET_NAME']

    trackInfo = json.loads(s3.get_object(
        Bucket=bucket, Key=key)["Body"].read())

    body_content = replace_encoded_emails(trackInfo)

    # put the decoded file in tracks/{trackId} in the bucket
    key = key.replace('encoded/', '')
    
    response = s3.put_object(Bucket=bucket, Key=key,
                  Body=body_content.encode('utf-8'))

    # snsResponse = sns.publish(
    #     TopicArn=topic_arn,
    #     Subject='Crawler/decodeEmails',
    #     Message=json.dumps({
    #         'keys': keys
    #     })
    # )

    return json.dumps(response)
