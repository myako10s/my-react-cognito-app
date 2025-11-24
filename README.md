# AWS Cognito マネージドログイン Sample

my-react-cognito-app は React (Vite) 製のサンプルアプリです。Amazon Cognito マネージドログイン (Managed Login) でサインイン・サインアウトを体験することに特化しており、UI はデジタル庁デザインシステムの色使い・コンポーネントを参考にしています。パッケージ管理は **pnpm** を利用します。ビルド済みのフロントエンドは (任意で) S3 + CloudFront にホスティングする想定です。

## セットアップ

```bash
pnpm install
cp .env.example .env
```

`.env` に以下を指定してください。

| キー | 説明 |
| --- | --- |
| `VITE_COGNITO_USER_POOL_ID` | Cognito ユーザープール ID |
| `VITE_COGNITO_USER_POOL_CLIENT_ID` | ユーザープールのアプリクライアント ID (シークレット無し) |
| `VITE_COGNITO_IDENTITY_POOL_ID` | Cognito Identity Pool ID (認証済みユーザーのみ許可) |
| `VITE_COGNITO_DOMAIN` | Cognito マネージドログイン (Hosted UI) ドメイン (例: `my-react-app-hosted.auth.ap-northeast-1.amazoncognito.com`。プレフィックスには `cognito` などの予約語を含められません) |
| `VITE_COGNITO_REDIRECT_SIGNIN` | マネージドログインから戻ってくるサインインリダイレクト URL (カンマ区切りで複数可) |
| `VITE_COGNITO_REDIRECT_SIGNOUT` | マネージドログインのサインアウト時リダイレクト URL |

## 実行

```bash
pnpm dev
```

- 「Cognitoでサインイン」ボタンを押すとマネージドログイン画面に遷移します。
- ログイン後は戻ってきたユーザー情報 (メール / ユーザー名) を画面に表示します。

## 実装のポイント

- `aws-amplify@^6` のモジュラー API (`aws-amplify/auth`, `aws-amplify/storage`) を使用。
- `src/lib/awsConfig.ts` で Amplify 設定と環境変数の検証を一元管理。
- `App.tsx` で Cognito マネージドログインとの連携とステータス表示をまとめて制御。
- `src/styles.css` にデジタル庁デザインシステムを参考にした配色・タイポグラフィを定義。

## AWS 構成ヒント

1. **Cognito ユーザープール**: メール属性を必須にし、SRP を利用するアプリクライアントを作成。
2. **Cognito マネージドログイン(Hosted UI) ドメイン**: 一意なドメインプレフィックスを設定し、`VITE_COGNITO_DOMAIN` に反映します。アプリクライアントでは Authorization code grant を有効にし、`VITE_COGNITO_REDIRECT_SIGNIN / SIGNOUT` と一致するリダイレクト URL を登録してください。
3. **Cognito Identity Pool**: 上記ユーザープールを認証プロバイダーとして紐付け、未認証アクセスは無効化。
4. **ホスティング**: 本番配信では `pnpm build` で生成した `dist/` を Amazon S3 などの静的ホスティングに配置し、CloudFront 経由で配信する構成を想定しています。

> 本プロジェクトは学習用サンプルです。実運用では追加のバリデーション、MFA、監査ログ等を導入し、安全な IAM ポリシーを適用してください。
