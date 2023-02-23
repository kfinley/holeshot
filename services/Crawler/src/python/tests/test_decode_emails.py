from botocore.stub import ANY

def test_decode_emails(s3_stub, sns_stub):

    from functions.decode_emails import handler

    event = {
        'Records': [{
            'EventSource': 'aws:sns',
            'EventVersion': '1.0',
            'EventSubscriptionArn': 'arn:aws:sns:us-east-1:146665891952:Holeshot-GetTracksForRegionTopic:e30400f5-a529-4780-b4b2-fd93e51b2cda',
            'Sns': {
                    'Type': 'Notification',
                    'MessageId': '0c9edab3-3b1b-55bd-be56-86dac9d5a7f7',
                    'TopicArn': 'arn:aws:sns:us-east-1:146665891952:Holeshot-GetTracksForRegionTopic',
                    'Subject': 'Crawler/getTrackForRegion',
                    'Message': '{"Region":"SC","Tracks":1,"keys":["USA-BMX/tracks/1639/trackInfo.json"]}',
                    'Timestamp': '2023-02-17T21:24:30.712Z',
                    'SignatureVersion': '1',
                    'Signature': 'rrl4VhlMBvG3ABpvjrNRY8VdQqJmdsnpvS7NcK4xY/i6jx9gxKdlMwM1/uqhhK1yd/LoW+D6qvPOg8vG0JzyLK9xdmao+0RqcVb64nA1JSzSK5zUtnuQSKOTKjYCpRwnK6z0ehK2goM+lhW0gvCRp/MJ+SgtopqSxBcQMq7V59YPuBpBsOl6t8W47krjbDZQag8V+9ggRlayIc/CTmpV2ZHT/W/nYcgoB8AJz9qV38S+cKO03PbtZ3EVN3F4gzqESntGJ1+F0frUaXxX6zZWZ3A4ewD3LFoTX8Yc4o5h+YVbYd/I3462n8+7nfixLKRjGmNUUWvlwmY+JvXUaJRB9Q==', 'SigningCertUrl': 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-56e67fcb41f6fec09b0196692625d385.pem', 'UnsubscribeUrl': 'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:146665891952:Holeshot-GetTracksForRegionTopic:e30400f5-a529-4780-b4b2-fd93e51b2cda',
                    'MessageAttributes': {}
                    }
        }]
    }

    context = ''

    trackInfo = open('services/Crawler/src/test-files/trackInfo-encoded.json')

    s3_stub.add_response(
        "get_object",
        expected_params={"Bucket": "bucket",
                         "Key": "USA-BMX/tracks/1639/trackInfo.json"},
        service_response={
            'Body': trackInfo
        },
    )

    s3_stub.add_response(
        "put_object",
        expected_params={
            'Body': ANY,
            'Bucket': 'bucket',
            'Key': 'USA-BMX/tracks/1639/trackInfo.json'},
        service_response={'ETag': '"14fe4f49fffffffffff9afbaaaaaaaa9"',
                          'ResponseMetadata': {'HTTPHeaders': {'content-length': '0',
                                                               'date': 'Wed, 08 Apr 2020 '
                                                               '20:35:42 GMT',
                                                               'etag': '"14fe4f49fffffffffff9afbaaaaaaaa9"',
                                                               'server': 'AmazonS3',
                                                               },
                                               'HTTPStatusCode': 200,
                                               'HostId': 'GEHrJmjk76Ug/clCVUwimbmIjTTb2S4kU0lLg3Ylj8GKrAIsv5+S7AFb2cRkCLd+mpptmxfubLM=',
                                               'RequestId': 'A8FFFFFFF84C3A77',
                                               'RetryAttempts': 0},
                          'VersionId': 'Dbc0gbLVEN4N5F4oz7Hhek0Xd82Mdgyo'
                          },
    )

    sns_stub.add_response(
        "publish",
        expected_params={
            'TopicArn': 'topic',
            'Subject': 'Crawler/decodeEmails',
            'Message': '{"keys": ["USA-BMX/tracks/1639/trackInfo.json"]}',
        },
        service_response={'MessageId': '7eb4e11c-b5ac-5dde-8531-bd76abad69f6',
                          'ResponseMetadata': {
                              'RequestId': 'fcebe895-c887-5c3f-934b-b4ffd686f817',
                              'HTTPStatusCode': 200,
                              'HTTPHeaders': {
                                  'x-amzn-requestid': 'fcebe895-c887-5c3f-934b-b4ffd686f817',
                                  'content-type': 'text/xml', 'content-length': '294',
                                  'date': 'Sat, 18 Feb 2023 00:28:49 GMT'},
                              'RetryAttempts': 0}
                          }
    )

    response = handler(event, context)

    assert response['statusCode'] == 200
