#!/usr/bin/env node

import { App } from 'aws-cdk-lib';
import { ServerlessSlackBotStack } from '../lib/serverless-slack-bot-stack';

const app = new App();

new ServerlessSlackBotStack(app, 'SimpleMemeServiceStack', {
  env: {
    account: '245824979453',
    region: 'us-west-2',
  },
});
