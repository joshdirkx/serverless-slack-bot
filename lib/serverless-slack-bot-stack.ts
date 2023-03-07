import { CfnParameter, Stack, StackProps } from 'aws-cdk-lib';
import { AccessLogFormat, CfnAccount, LambdaIntegration, LogGroupLogDestination, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, Code, Function, Handler, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

var path = require('path');

export class ServerlessSlackBotStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const role = new Role(this, 'serverlessSlackBotRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs'));

    new CfnAccount(this, 'account', {
      cloudWatchRoleArn: role.roleArn,
    });

    const slackToken = new CfnParameter(this, 'slackToken', {
      type: "String",
      description: "Token for your Slack Bot",
    });

    const lambda = new Function(this, 'serverlessSlackBotHandler', {
      code: Code.fromAssetImage(path.join(__dirname, '..', 'lambda')),
      handler: Handler.FROM_IMAGE,
      runtime: Runtime.FROM_IMAGE,
      architecture: Architecture.ARM_64,
      environment: {
        SLACK_TOKEN: slackToken.valueAsString,
      },
    });

    const logGroup = new LogGroup(this, 'serverlessSlackBotLogs');

    const api = new RestApi(this, 'api', {
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(logGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
      },
    });
    
    const lambdaApi = api.root.addResource('lambda');

    const lambdaIntegration = new LambdaIntegration(lambda, {
      proxy: true,
    });

    lambdaApi.addMethod("POST", lambdaIntegration);
  };
};
