import json
from commands.decode_emails import process

def handler(event, lambda_context):

    print(event)
    key = json.loads(event['Records'][0]['s3']['object']['key'])

    response = process(key)

    return {
        'statusCode': 200,
        'body': json.dumps(
          {
            'Success': True,
            'Response': response
          })
    }
