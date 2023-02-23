import pytest
from botocore.stub import Stubber
import os
os.environ['AWS_DEFAULT_REGION'] = 'us-east-1'
os.environ['BUCKET_NAME'] = 'bucket'
os.environ['DECODE_EMAILS_TOPIC_ARN'] = 'topic'

from services.Crawler.src.python.functions.aws_resources import s3, sns

@pytest.fixture(autouse=True)
def s3_stub():
    with Stubber(s3) as stubber:
        yield stubber
        stubber.assert_no_pending_responses()


@pytest.fixture(autouse=True)
def sns_stub():
    with Stubber(sns) as stubber:
        yield stubber
        stubber.assert_no_pending_responses()
