
# CODEHUN (コデホン) — E-Commerce デモ

ポートフォリオ用のデモサイトです。実際の商用サービスではありません。実在の個人情報は入力しないでください。
これはポートフォリオ用のデモです。実在の個人情報は入力しないでください。

## 🔗 デモ

* URL: [https://13.209.88.121:8080](https://13.209.88.121:8080)
* IPベースのHTTPSではブラウザで警告が表示される場合があります。*
* ※デモアカウントはリクエスト時に提供※

## ✨ 主な機能

### 会員/認証

* 会員登録、ログイン（JWT）、ログアウト
* メール認証（Redis + Gmail SMTP、認証コードの有効期限）
* パスワード変更/再設定
* 権限チェック（Spring Security、@PreAuthorize）

### 商品/注文

* 商品一覧/詳細、オプション、カート
* 会員/非会員の注文（ゲスト注文トークン）
* 注文照会/詳細、在庫減算/検証

### コミュニケーション

* FAQ 登録/閲覧
* STOMP WebSocket 個人チャット

### 管理者

* 商品登録/修正（サムネイル/本文画像の S3 アップロード）
* 注文管理、FAQ 回答登録

### インフラ

* AWS EC2（FE/BE）、RDS（MariaDB）、S3（画像）、Redis
* GitHub Actions（タグ `version*` プッシュ時にビルド/デプロイ）

## 🧱 技術スタック

* フロントエンド: React（Vite）・TailwindCSS・DaisyUI・Axios・React Router・Sonner（toast）
* バックエンド: Spring Boot・Spring Security・JWT・Hibernate/JPA・Validation
* DB/キャッシュ: MariaDB（RDS）・Redis
* インフラ: AWS EC2・S3・RDS
* その他: STOMP（WebSocket）・Gmail SMTP

## 🗂️ ディレクトリ構成（概要）

```text
/backend
├─ src/main/java/com/example/backend
│  ├─ alert/
│  ├─ chat/
│  ├─ email/
│  ├─ faq/
│  ├─ member/
│  ├─ pay/
│  ├─ product/
│  ├─ qna/
│  ├─ util/
│  ├─ config/          （App, Email, PasswordEncoder, Redis, Web）
│  └─ BackendApplication
└─ src/main/resources/application.yml
```

```text
/frontend
├─ src/feature
│  ├─ alert/
│  ├─ Chat/
│  ├─ common/
│  ├─ FaQ/
│  ├─ Member/
│  ├─ Order/
│  ├─ Product/
│  ├─ Qna/
│  └─ tosspayment/
├─ App.jsx
└─ vite.config.ts
```

## 🔒 セキュリティ & 検証ポイント

* パスワードは BCrypt で単方向保存
* 入力値検証（ID/氏名/電話/メールの正規表現）
* JWT 認証 + @PreAuthorize でエンドポイントを保護
* メール認証コードの有効期限（例: 3分）、重複送信防止
* S3 アップロード時の拡張子/容量検証（TODO: 詳細ポリシーを文書化）
* CORS: フロントのドメインのみ許可（TODO: 実際の配布ドメインを記載）

## 🚀 デプロイ（概要）

* EC2: フロント/バックエンドのサービス
* RDS（MariaDB）、S3（画像）、Redis
* （任意）GitHub Actions: `tags: version*` → Build & Deploy

  * FE: `npm ci && npm run build` → 静的ファイル配布
  * BE: `./gradlew build` → JAR 差し替え & 再起動

## 📄 ライセンス

* 個人のポートフォリオ目的。商用利用は禁止。
* （必要に応じて）MIT またはカスタムライセンスを明記


