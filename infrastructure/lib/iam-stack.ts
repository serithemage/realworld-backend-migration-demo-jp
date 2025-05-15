import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

/**
 * IAMスタック - ユーザー、グループ、ロールの設定
 * 
 * このスタックでは以下のリソースを作成します：
 * - 開発者用IAMグループとユーザー
 * - Lambda実行ロール
 * - DynamoDBアクセスロール
 * - API Gatewayロール
 */
export class IamStack extends cdk.Stack {
  // 他のスタックから参照できるようにロールをパブリックプロパティとして公開
  public readonly lambdaExecutionRole: iam.Role;
  public readonly dynamoDbAccessRole: iam.Role;
  public readonly apiGatewayRole: iam.Role;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 開発者グループの作成
    const developersGroup = new iam.Group(this, 'DevelopersGroup', {
      groupName: 'RealWorldDevelopers',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonAPIGatewayAdministrator'),
      ],
    });

    // 開発者用カスタムポリシーの作成
    const developerPolicy = new iam.ManagedPolicy(this, 'DeveloperPolicy', {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'cloudformation:Describe*',
            'cloudformation:List*',
            'cloudformation:Get*',
            'cloudformation:ValidateTemplate',
          ],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'logs:DescribeLogGroups',
            'logs:DescribeLogStreams',
            'logs:GetLogEvents',
            'logs:FilterLogEvents',
          ],
          resources: ['*'],
        }),
      ],
    });

    // 開発者グループにカスタムポリシーをアタッチ
    developersGroup.addManagedPolicy(developerPolicy);

    // Lambda実行ロールの作成
    this.lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for RealWorld Serverless Lambda functions execution',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Lambda実行ロールにCloudWatchLogsへのアクセス権を追加
    this.lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: ['arn:aws:logs:*:*:*'],
      })
    );

    // DynamoDBアクセスロールの作成
    this.dynamoDbAccessRole = new iam.Role(this, 'DynamoDbAccessRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for accessing DynamoDB tables in RealWorld Serverless application',
    });

    // DynamoDBアクセスロールにDynamoDBへのアクセス権を追加
    this.dynamoDbAccessRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:BatchGetItem',
          'dynamodb:BatchWriteItem',
        ],
        resources: ['arn:aws:dynamodb:*:*:table/RealWorld*'],
      })
    );

    // API Gatewayロールの作成
    this.apiGatewayRole = new iam.Role(this, 'ApiGatewayRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      description: 'Role for API Gateway to invoke Lambda functions in RealWorld Serverless application',
    });

    // API Gatewayロールにロググループとストリームの作成権限を追加
    this.apiGatewayRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:DescribeLogGroups',
          'logs:DescribeLogStreams',
          'logs:PutLogEvents',
        ],
        resources: ['arn:aws:logs:*:*:*'],
      })
    );

    // API GatewayロールにLambda関数の呼び出し権限を追加
    this.apiGatewayRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: ['arn:aws:lambda:*:*:function:RealWorld*'],
      })
    );

    // 出力の定義
    new cdk.CfnOutput(this, 'DevelopersGroupName', {
      value: developersGroup.groupName,
      description: 'Name of the developers IAM group',
    });

    new cdk.CfnOutput(this, 'LambdaExecutionRoleArn', {
      value: this.lambdaExecutionRole.roleArn,
      description: 'ARN of the Lambda execution role',
    });

    new cdk.CfnOutput(this, 'DynamoDbAccessRoleArn', {
      value: this.dynamoDbAccessRole.roleArn,
      description: 'ARN of the DynamoDB access role',
    });

    new cdk.CfnOutput(this, 'ApiGatewayRoleArn', {
      value: this.apiGatewayRole.roleArn,
      description: 'ARN of the API Gateway role',
    });
  }
}
