import { CfnOutput, CfnParameter, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Architecture, Code, Function, Handler, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

var path = require('path');

export class ServerlessSlackBotStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const slackToken = new CfnParameter(this, 'slackToken', {
      type: "String",
      description: "Token for your Slack Bot",
    });

    const lambda = new Function(this, 'simpleMemeServiceHandler', {
      code: Code.fromAssetImage(path.join(__dirname, '..', 'lambda')),
      handler: Handler.FROM_IMAGE,
      runtime: Runtime.FROM_IMAGE,
      architecture: Architecture.ARM_64,
      environment: {
        SLACK_TOKEN: slackToken.valueAsString,
      },
    });

    const api = new RestApi(this, 'api');

    const lambdaApi = api.root.addResource('lambda');

    const lambdaIntegration = new LambdaIntegration(lambda, {
      proxy: true,
    });

    lambdaApi.addMethod("POST", lambdaIntegration);

    new CfnOutput(this, 'simpleMemeServiceHandlerUrl', {
      value: api.url,
    });
  };
};
