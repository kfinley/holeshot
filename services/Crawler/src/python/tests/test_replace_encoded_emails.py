import os
import json

def test_replace_encoded_emails():

    from commands.decode_emails import replace_encoded_emails

    trackInfo = json.loads(open('services/Crawler/src/test-files/trackInfo-encoded.json').read())

    result = replace_encoded_emails(trackInfo)

    trackInfo = open(
        'services/Crawler/src/test-files/trackInfo.json', 'w')
    trackInfo.write(result)

    trackInfo.close()

    assert result != json.dumps(open(
        'services/Crawler/src/test-files/trackInfo-encoded.json').read(), ensure_ascii=False)
