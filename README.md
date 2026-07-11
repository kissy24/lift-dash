# LiftDash

Track your sets, visualize your gains — a personal strength training log and analytics dashboard.

LiftDashは、種目・プリセット・セット単位のトレーニング記録を管理し、成長をダッシュボードで可視化する個人向けWebアプリです。メールアドレスとパスワードに加えて、TOTPによるMFAを必須としています。

## 主な機能

- メールアドレス・パスワードとTOTP MFAによるログイン
- 筋肉部位付きの種目マスタ管理
- 種目、重量、レップ数、セット数をまとめたプリセット管理
- 手動入力またはプリセットからのトレーニング記録
- 同じ種目の前回実績値による入力補完
- カレンダー形式の記録一覧と日別詳細・編集・削除
- 最大重量、総ボリューム、頻度、部位別割合、週次ボリュームの可視化
- 種目ごとの自己ベスト表示
- 期間・種目によるダッシュボードフィルター

## 技術スタック

- Bun 1.2.0
- Next.js 15 App Router / React 18 / TypeScript
- Tailwind CSS / Recharts / React Hook Form / Zod
- Supabase Auth / PostgreSQL / Row Level Security
- Vitest / React Testing Library

## 前提条件

セットアップ前に次を用意してください。

- [Bun](https://bun.sh/docs/installation) 1.2.0
- Node.js 22以上（テスト・Lintなどの開発ツール実行用）
- [Supabase](https://supabase.com/)プロジェクト
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- TOTPに対応した認証アプリ

## セットアップ

### 1. リポジトリと依存関係

```bash
git clone https://github.com/kissy24/lift-dash.git
cd lift-dash
bun install --frozen-lockfile
```

パッケージマネージャーにはBunを使用します。`npm install`や`yarn install`は使用しないでください。

### 2. Supabaseプロジェクト

1. Supabase Dashboardでプロジェクトを作成します。
2. AuthenticationのEmail providerを有効にします。
3. AuthenticationのMFA設定でTOTPを利用できることを確認します。
4. Authentication > Usersから、このアプリを利用するユーザーを作成します。

LiftDashにはサインアップ画面がありません。初期ユーザーはSupabase Dashboardで作成してください。認証の詳細は[Supabase Password-based Auth](https://supabase.com/docs/guides/auth/passwords)と[TOTP MFA](https://supabase.com/docs/guides/auth/auth-mfa/totp)を参照してください。

### 3. Database migration

Supabase CLIでログインし、作成したremote projectへリポジトリを紐付けます。

```bash
supabase login
supabase link --project-ref <project-ref>
```

適用予定のmigrationを確認してから反映します。

```bash
supabase db push --dry-run
supabase db push
```

`supabase/migrations/`にある次のスキーマが日時順で適用されます。

- 種目マスタとAAL2必須RLS
- トレーニングセッション・セットと原子的な保存関数
- 記録の編集・削除関数
- プリセットとプリセット項目

`supabase db push`は紐付けたremote databaseを変更します。`project-ref`とdry-runの内容を確認してから実行してください。コマンドの詳細は[`supabase link`](https://supabase.com/docs/reference/cli/supabase-link)と[`supabase db push`](https://supabase.com/docs/reference/cli/supabase-db-push)を参照してください。

### 4. 環境変数

サンプルをコピーします。

```bash
cp .env.example .env.local
```

Supabase DashboardのProject Settings > APIで確認した値を設定します。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

このアプリの通常動作に`SUPABASE_SERVICE_ROLE_KEY`は不要です。service role keyを`NEXT_PUBLIC_`変数へ設定したり、ブラウザへ渡したりしないでください。

### 5. 開発サーバー

```bash
bun run dev
```

[http://localhost:3000](http://localhost:3000)を開きます。未認証の場合は`/login`へリダイレクトされます。

## 初回ログイン

1. Supabase Dashboardで作成したメールアドレスとパスワードでログインします。
2. 初回は`/mfa/enroll`へ移動します。
3. 表示されたQRコードまたは設定キーを認証アプリへ登録します。
4. 認証アプリの6桁コードを入力してTOTPを検証します。
5. AAL2セッションになると`/dashboard`へ移動します。

2回目以降のログインでは、パスワード認証後に`/mfa/verify`でTOTPコードを入力します。保護ページと書き込み処理はAAL2に達していないセッションを拒否します。

## 使い方

### 種目マスタ

`/exercises`で種目を登録します。種目名と、胸・背中・脚・肩・腕・体幹・有酸素・その他の筋肉部位を設定できます。登録済み種目の編集・削除も同じ画面から行えます。

### プリセット

`/presets`で「胸の日」などのプリセットを作成します。種目ごとにデフォルトの重量・レップ数・セット数と表示順を設定できます。

### トレーニング記録

`/log/new`で日付とメモを入力し、次のどちらかで種目を追加します。

- プリセットを選択して種目とセットをまとめて展開する
- 種目マスタから手動で種目を追加する

種目ごとに直近の実績値がある場合は前回値が優先され、なければプリセットのデフォルト値が使われます。セットは追加・削除でき、重量とレップ数を個別に編集できます。保存後は対象日の詳細画面へ移動します。

### 記録一覧・詳細

`/log`ではトレーニング日をカレンダーで確認できます。日付を選ぶと`/log/[date]`で全セッションとセットを表示し、記録の編集・削除ができます。

### ダッシュボード

`/dashboard`では次を確認できます。

- 種目別の最大重量推移
- 種目別の総ボリューム推移
- トレーニング頻度
- 部位別ボリューム割合
- 週次ボリューム
- 種目ごとの自己ベスト

期間は直近30日・90日・180日・1年・全期間から選択できます。全種目または特定種目へ絞り込むと、グラフと自己ベストへ同じ条件が反映されます。フィルター状態はURL queryに保存されます。

## 開発・検証コマンド

| コマンド | 内容 |
|---|---|
| `bun run dev` | 開発サーバーを起動 |
| `bun run type-check` | TypeScript型チェック |
| `bun run lint` | ESLint（warnings 0を要求） |
| `bun run test` | Vitestをwatch modeで起動 |
| `bun run test:run` | 全テストを1回実行 |
| `bun run test:coverage` | カバレッジを生成 |
| `bun run format:check` | Prettier差分を確認 |
| `bun run build` | production build |

依存関係を追加・更新した場合は、[OSV-Scanner](https://google.github.io/osv-scanner/)でも監査します。

```bash
osv-scanner scan source -L bun.lock
```

## セキュリティ

- `.env.local`、`.env`、秘密鍵をcommitしないでください。
- publicなanon keyだけをアプリで利用し、service role keyは使用しないでください。
- 全DBテーブルはRLSで保護され、書き込みには認証済みAAL2セッションが必要です。
- Server Actionsは認証・AAL2確認とZod validationを行います。
- 新しい依存バージョンは公開から7日間のクールタイム後に採用します。
- `bun install --frozen-lockfile`を使い、`package.json`と`bun.lock`の整合を維持します。

## ディレクトリ概要

```text
app/                  Next.js App Routerのページ
components/           フォーム、グラフ、表示コンポーネント
lib/actions/          認証・書き込み用Server Actions
lib/supabase/         Supabase clientとDatabase型
lib/workouts/         記録・ダッシュボードの純粋関数
supabase/migrations/  Database schema、RLS、DB関数
docs/issues/          Issue定義
docs/works/           Issueごとの作業記録
```

詳細な仕様は[`docs/LiftDash_requirements.md`](docs/LiftDash_requirements.md)を参照してください。
