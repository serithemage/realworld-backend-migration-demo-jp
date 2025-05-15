#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { IamStack } from '../lib/iam-stack';

/**
 * RealWorldバックエンドアプリケーションのAWSサーバーレスアーキテクチャ
 * 
 * このアプリケーションは以下のスタックをデプロイします：
 * 1. IAMスタック - ユーザー、グループ、ロールの設定
 * 2. インフラストラクチャスタック - VPCとネットワークリソースの設定
 */
const app = new cdk.App();

// 環境設定
const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1' // デフォルトは東京リージョン
};

// スタックのプレフィックス
const stackPrefix = 'RealWorldServerless';

// IAMスタックの作成
const iamStack = new IamStack(app, `${stackPrefix}-IAM`, {
  env,
  description: 'IAM resources for RealWorld Serverless Backend Application',
});

// インフラストラクチャスタックの作成
const infraStack = new InfrastructureStack(app, `${stackPrefix}-Infrastructure`, {
  env,
  description: 'Network infrastructure for RealWorld Serverless Backend Application',
});

// スタック間の依存関係を設定
infrStack.addDependency(iamStack);

// タグを追加
cdk.Tags.of(app).add('Project', 'RealWorldServerless');
cdk.Tags.of(app).add('Environment', 'Development');
cdk.Tags.of(app).add('ManagedBy', 'AWS-CDK');