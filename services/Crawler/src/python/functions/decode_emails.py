import json
from commands.decode_emails import process

def handler(event, lambda_context):

    print(event)
    message = json.loads(event['Records'][0]['s3']['object'])

    response = process(message['key'])

    return {
        'statusCode': 200,
        'body': json.dumps(
          {
            'Success': True,
            'Response': response
          })
    }
