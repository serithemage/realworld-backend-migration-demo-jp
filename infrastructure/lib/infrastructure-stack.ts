import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

/**
 * メインインフラストラクチャスタック - VPCとネットワークリソースの設定
 * 
 * このスタックでは以下のリソースを作成します：
 * - VPC
 * - パブリックサブネットとプライベートサブネット
 * - インターネットゲートウェイ
 * - NATゲートウェイ
 * - ルートテーブル
 * - セキュリティグループ
 */
export class InfrastructureStack extends cdk.Stack {
  // 他のスタックから参照できるようにリソースをパブリックプロパティとして公開
  public readonly vpc: ec2.Vpc;
  public readonly lambdaSecurityGroup: ec2.SecurityGroup;
  public readonly databaseSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPCの作成
    this.vpc = new ec2.Vpc(this, 'RealWorldVpc', {
      maxAzs: 2, // 2つのアベイラビリティゾーンを使用
      cidr: '10.0.0.0/16',
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
      natGateways: 1, // コスト削減のため1つのNATゲートウェイを使用
    });

    // Lambda関数用のセキュリティグループ
    this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Lambda functions',
      allowAllOutbound: true,
    });

    // データベース用のセキュリティグループ
    this.databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for databases',
      allowAllOutbound: false,
    });

    // Lambda関数からデータベースへのアクセスを許可
    this.databaseSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow access from Lambda functions to PostgreSQL'
    );

    this.databaseSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      ec2.Port.tcp(27017),
      'Allow access from Lambda functions to MongoDB'
    );

    // 出力の定義
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'ID of the VPC',
    });

    new cdk.CfnOutput(this, 'PublicSubnets', {
      value: this.vpc.publicSubnets.map(subnet => subnet.subnetId).join(','),
      description: 'IDs of public subnets',
    });

    new cdk.CfnOutput(this, 'PrivateSubnets', {
      value: this.vpc.privateSubnets.map(subnet => subnet.subnetId).join(','),
      description: 'IDs of private subnets',
    });

    new cdk.CfnOutput(this, 'LambdaSecurityGroupId', {
      value: this.lambdaSecurityGroup.securityGroupId,
      description: 'ID of the Lambda security group',
    });

    new cdk.CfnOutput(this, 'DatabaseSecurityGroupId', {
      value: this.databaseSecurityGroup.securityGroupId,
      description: 'ID of the database security group',
    });
  }
}
