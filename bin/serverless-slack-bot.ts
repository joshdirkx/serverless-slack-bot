#!/usr/bin/env node

import { App } from 'aws-cdk-lib';
import { ServerlessSlackBotStack } from '../lib/serverless-slack-bot-stack';

const app = new App();

new ServerlessSlackBotStack(app, 'ServerlessSlackBotStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
  },
});
