import { Duration, StackProps } from "aws-cdk-lib";
import { Code, FunctionProps, Runtime, Function } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import { Construct } from "constructs";

interface LambdaAssetProps {
  functionFolderPath: string;
}

interface PythonLambdaFunctionProps extends StackProps {
  functionName: string;
  lambdaAssetProps: LambdaAssetProps;
  lambdaProps?: FunctionProps;
}

export class PythonLambdaFunction extends Construct {
  public lambdaAsset: Asset;
  public lambda: Function;

  constructor(
    app: Construct,
    id: string,
    props: PythonLambdaFunctionProps
  ) {
    super(app, id);

    // Adds the function to our S3 bucket
    this.lambdaAsset = new Asset(this, `${props.functionName}-LambdaAssets`, {
      path: props.lambdaAssetProps.functionFolderPath,
    });

    // We will set base lambda props as a default
    // but allow them to be overriden
    const baseLambdaProps = {
      code: Code.fromBucket(
        this.lambdaAsset.bucket,
        this.lambdaAsset.s3ObjectKey
      ),
      timeout: Duration.seconds(300),
      runtime: Runtime.PYTHON_3_9,
      handler: "index.handler",
      functionName: props.functionName,
      logRetention: RetentionDays.ONE_WEEK
    };

    // Override our defaults if a lambdaProps object is supplied
    const lambdaFnProps = {
      ...baseLambdaProps,
      ...props.lambdaProps,
    };

    this.lambda = new Function(this, `${props.functionName}-LambdaFunction`, lambdaFnProps);
  }
}
