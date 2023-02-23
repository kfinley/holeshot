import json
from services.Crawler.src.python.commands.decode_emails import process

def handler(event, lambda_context):

    message = json.loads(event['Records'][0]['Sns']['Message'])
    
    response = process(message['keys'])

    return {
        'statusCode': 200,
        'body': json.dumps(
          {
            'Success': True,
            'Response': response
          })
    }
