# RealWorld バックエンドアプリケーション AWS サーバーレスアーキテクチャ マイグレーション

![RealWorld Example App](logo.png)

> ### Spring Boot から AWS サーバーレスへの移行プロジェクト：[RealWorld](https://github.com/gothinkster/realworld) 仕様に準拠したバックエンドAPI

### [RealWorld](https://github.com/gothinkster/realworld)&nbsp;&nbsp;&nbsp;&nbsp;[Demo](https://demo.realworld.io/)

## プロジェクト概要

このプロジェクトは、既存のSpring Bootベースの「RealWorld」バックエンドアプリケーションをAWSサーバーレスアーキテクチャに移行するものです。現在のモノリシックなアプリケーションをマイクロサービスベースのサーバーレスアーキテクチャに移行することで、以下の目標を達成します：

- スケーラビリティの向上
- 運用コストの削減
- 開発効率の向上

## 現行システム

![現行システム図](1-system-diagram.svg)

現在のRealWorldアプリケーションは以下の特徴を持っています：

- [モジュラーモノリスアーキテクチャ](https://www.milanjovanovic.tech/blog/what-is-a-modular-monolith)を採用し、明確に定義された境界と独立したモジュール（[users](src/main/java/com/marcusmonteirodesouza/realworld/api/users)、[profiles](src/main/java/com/marcusmonteirodesouza/realworld/api/profiles)、[articles](src/main/java/com/marcusmonteirodesouza/realworld/api/articles)）を持つ
- [Spring Security](https://spring.io/projects/spring-security)と[Keycloak](https://www.keycloak.org/)を使用したユーザー登録、認証、認可
- [PostgreSQL](https://www.postgresql.org/)をデータベースとして使用
- [Jakarta Persistence](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/persist/persistence-intro/persistence-intro.html) (JPA)をORMとして使用
- 例外を[一元的に処理](src/main/java/com/marcusmonteirodesouza/realworld/api/exceptionhandlers/RestResponseEntityExceptionHandler.java)

## 移行後のアーキテクチャ

### システムコンポーネント

1. **API Gateway**
   - REST APIエンドポイントの提供
   - リクエストのルーティング
   - 認証・認可の統合
   - API文書化（Swagger/OpenAPI）

2. **Lambda関数**
   - 機能ごとに分離されたマイクロサービス
   - ユーザー管理サービス
   - プロフィール管理サービス
   - 記事管理サービス
   - コメント管理サービス
   - タグ管理サービス

3. **認証サービス**
   - Amazon Cognito または既存のKeycloakをAWS上で実行
   - JWTトークン管理
   - ユーザープール管理

4. **データストア**
   - Amazon DynamoDB（NoSQLデータベース）
   - Amazon Aurora Serverless（リレーショナルデータベース、必要に応じて）

5. **ストレージ**
   - Amazon S3（ユーザーアバターや記事の添付ファイル用）

6. **キャッシュ**
   - Amazon ElastiCache（Redis）

7. **モニタリングと分析**
   - Amazon CloudWatch
   - AWS X-Ray

## 開発ロードマップ

### フェーズ1: 基盤構築とPoC

1. AWS環境のセットアップ
2. 認証サービスの実装
3. 基本的なデータストアの設計と実装
4. 最小限のAPIエンドポイント実装

### フェーズ2: コア機能の実装

1. ユーザー管理サービスの完全実装
2. プロフィール管理サービスの実装
3. 記事管理サービスの基本実装
4. 統合テストとパフォーマンステスト

### フェーズ3: 拡張機能と最適化

1. コメント、タグ、お気に入り機能の実装
2. キャッシュ層の実装
3. パフォーマンス最適化
4. セキュリティ強化

### フェーズ4: 完成と移行

1. 最終テストと品質保証
2. ドキュメント作成
3. 本番環境への段階的デプロイ
4. モニタリングとフィードバック収集

## 開発環境のセットアップ

1. `.env.example`ファイルをコピーして`.env`ファイルを作成します。
   ```
   cp .env.example .env
   ```

2. 必要なAWS認証情報と環境変数を設定します。

3. 開発ツールと依存関係をインストールします。

## 現行システムの実行方法（参考）

### Keycloakのセットアップ

[ドキュメント](docs/set-up-keycloak)に従ってKeycloakをセットアップします。

### アプリケーションの実行

1. `docker compose up`を実行します。
2. ユーザー登録や更新を行うと、[Keycloak管理コンソール](http://localhost:8081)でユーザー情報を確認できます。
   ![Keycloakに登録されたユーザー](./2-registered-user-in-keycloak.png)
   ![Keycloakに登録されたユーザーの属性](./3-registered-user-in-keycloak-attributes.png)
