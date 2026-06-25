# 筋トレ記録・可視化アプリ 要求・要件定義書

**プロダクト名**: LiftDash
**タグライン**: "Track your sets, visualize your gains — a personal strength training log and analytics dashboard."
**バージョン**: 1.0
**対象**: AIエージェントへの実装委託用

---

## 目次

1. プロジェクト概要
2. 機能要件
3. 非機能要件
4. 技術スタック
5. DBスキーマ
6. 画面構成・ルーティング
7. UXフロー詳細
8. ダッシュボード仕様
9. セキュリティポリシー
10. インフラ構成・コスト
11. 環境変数定義
12. ディレクトリ構成
13. 開発フェーズ
14. 制約・注意事項

---

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| 目的 | 個人の筋トレ記録を入力し、ダッシュボードで進捗を可視化する |
| ユーザー | 1名（オーナー自身のみ） |
| アクセス方法 | スマートフォン / PC ブラウザ（両対応必須） |
| インフラ方針 | 可能な限り無料枠で運用 |

---

## 2. 機能要件

### 2.1 認証

- メール + パスワードによるログイン（Supabase Auth）
- **MFA（多要素認証）を必須化**（TOTP推奨）
- セッション管理（JWT + Refresh Token）
- 未認証時はすべてのページを `/login` にリダイレクト

### 2.2 種目マスタ管理

- 種目の登録・編集・削除
- 項目: 種目名、筋肉部位（`chest` / `back` / `legs` / `shoulders` / `arms` / `core` / `cardio` / `other`）

### 2.3 プリセット管理

- プリセット（例: 「月曜: 胸の日」）の登録・編集・削除
- プリセットに種目を複数紐付け
  - 各種目にデフォルト値（重量・レップ数・セット数）を設定可能
  - 表示順序の変更

### 2.4 トレーニング記録

- プリセット選択 → 一括入力フォームを展開
  - 前回の同種目の実績値を自動補完（前回値優先、なければプリセットのデフォルト値）
  - セットごとに重量・レップ数を個別編集可能
  - セット数は ＋/－ ボタンで動的追加・削除
- 種目を手動追加する入力も可能
- 記録の編集・削除（セッション単位 / セット単位）
- 日付の指定（デフォルト: 今日）

### 2.5 記録一覧・詳細

- カレンダービュー（トレーニングした日をハイライト）
- 特定日の記録詳細表示
- 記録の編集・削除

### 2.6 ダッシュボード

「8. ダッシュボード仕様」を参照。

---

## 3. 非機能要件

| 項目 | 要件 |
|---|---|
| レスポンシブ | モバイルファースト。sm(640px) / md(768px) / lg(1024px) |
| パフォーマンス | LCP 3秒以内目標 |
| オフライン | 非対応（インターネット接続必須） |
| ブラウザ対応 | モダンブラウザ（Chrome / Safari / Firefox 最新版） |

---

## 4. 技術スタック

### 4.1 ランタイム・パッケージマネージャー

**Bun** を採用する。

> **Deno を採用しない理由**: Next.js が Deno ランタイムを公式サポートしていない。`npm:` プレフィックスによる互換性は向上しているが、Next.js の複雑な依存関係では不安定なケースが残る。Bun は npm エコシステムとの互換性が高く、Next.js も公式サポート済み。

```bash
# 基本コマンド対応表
# npm install  →  bun install
# npm run dev  →  bun run dev
# npx <cmd>    →  bunx <cmd>
# npm run build → bun run build
```

### 4.2 フロントエンド / BFF

| 役割 | ライブラリ |
|---|---|
| フレームワーク | Next.js 14（App Router） |
| スタイリング | Tailwind CSS v3 |
| UIコンポーネント | shadcn/ui |
| グラフ | Recharts |
| フォーム | React Hook Form + Zod |
| 日付操作 | date-fns |
| 状態管理 | React Server Components + `useState` で完結。複雑化したら Zustand を追加 |

### 4.3 バックエンド / DB

| 役割 | サービス・技術 |
|---|---|
| DB | Supabase（PostgreSQL） |
| 認証 | Supabase Auth |
| アクセス制御 | Row Level Security（RLS） |
| APIレイヤー | Next.js Server Actions（外部エンドポイント不要） |

### 4.4 ホスティング

| サービス | プラン |
|---|---|
| フロントエンド | Vercel（Hobby プラン） |
| DB / Auth | Supabase（Free プラン） |

---

## 5. DBスキーマ

### 5.1 テーブル定義

```sql
-- 種目マスタ
create table exercises (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  muscle_group text check (muscle_group in (
    'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'other'
  )),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- プリセット
create table presets (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- プリセットアイテム（プリセットに含まれる種目とデフォルト値）
create table preset_items (
  id             uuid primary key default gen_random_uuid(),
  preset_id      uuid not null references presets(id) on delete cascade,
  exercise_id    uuid not null references exercises(id) on delete cascade,
  order_index    int  not null default 0,
  default_weight numeric(6,2),
  default_reps   int,
  default_sets   int default 3,
  created_at     timestamptz not null default now()
);

-- トレーニングセッション（1日に複数回も可）
create table workout_sessions (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- セット記録（セットごとに重量・レップが変わることを許容）
create table workout_sets (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references workout_sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  set_number  int  not null,
  weight      numeric(6,2) not null,  -- kg 単位
  reps        int  not null,
  created_at  timestamptz not null default now()
);

-- インデックス
create index idx_workout_sessions_date on workout_sessions(date);
create index idx_workout_sets_session  on workout_sets(session_id);
create index idx_workout_sets_exercise on workout_sets(exercise_id);
```

### 5.2 RLS ポリシー

```sql
-- 全テーブルで RLS を有効化
alter table exercises        enable row level security;
alter table presets          enable row level security;
alter table preset_items     enable row level security;
alter table workout_sessions enable row level security;
alter table workout_sets     enable row level security;

-- 認証済みユーザーのみ全操作を許可
create policy "authenticated_full_access" on exercises
  for all using (auth.role() = 'authenticated');

create policy "authenticated_full_access" on presets
  for all using (auth.role() = 'authenticated');

create policy "authenticated_full_access" on preset_items
  for all using (auth.role() = 'authenticated');

create policy "authenticated_full_access" on workout_sessions
  for all using (auth.role() = 'authenticated');

create policy "authenticated_full_access" on workout_sets
  for all using (auth.role() = 'authenticated');
```

---

## 6. 画面構成・ルーティング

```
/                        ← リダイレクト（未認証: /login、認証済み: /dashboard）
/login                   ← ログイン画面（MFA入力含む）
/dashboard               ← ダッシュボード（メイン画面）
/log                     ← 記録一覧（カレンダービュー）
/log/new                 ← 記録入力
/log/[date]              ← 特定日の記録詳細・編集（例: /log/2025-01-15）
/presets                 ← プリセット一覧
/presets/new             ← プリセット新規作成
/presets/[id]            ← プリセット編集
/exercises               ← 種目マスタ一覧・管理
```

---

## 7. UXフロー詳細

### 7.1 記録入力フロー

```
① /log/new にアクセス
        ↓
② プリセット選択 または「手動で種目を追加」
        ↓（プリセット選択の場合）
③ プリセット内の種目リストが展開される
   各セットに【前回値】を自動入力
   （前回値がなければプリセットのデフォルト値を使用）
        ↓
④ 重量・レップ数を確認・修正
   ＋/－ ボタンでセット数を増減
        ↓
⑤ 「保存」→ /log/[today] にリダイレクト
```

### 7.2 前回値の取得クエリ

```sql
-- 特定種目の直近セット記録を取得（入力フォームの初期値用）
select ws.set_number, ws.weight, ws.reps
from workout_sets ws
join workout_sessions s on ws.session_id = s.id
where ws.exercise_id = $1
order by s.date desc, ws.set_number asc
limit 10;
```

---

## 8. ダッシュボード仕様

### 8.1 指標一覧

| 指標 | グラフ種類 | 集計ロジック |
|---|---|---|
| 種目別 最大重量推移 | 折れ線グラフ | セッションごとの `MAX(weight)` |
| 種目別 総ボリューム推移 | 棒グラフ | `SUM(weight × reps)` per セッション |
| トレーニング頻度 | ヒートマップ | 日ごとのセッション有無（GitHub Contributions 風） |
| 自己ベスト (PR) | カード表示 | 種目ごとの歴代 `MAX(weight)` |
| 部位別トレーニング割合 | ドーナツグラフ | 直近30日の `muscle_group` 別ボリューム割合 |
| 週次ボリューム合計 | 棒グラフ | 週単位の `SUM(weight × reps)` |

### 8.2 フィルター

- **期間**: 直近30日 / 90日 / 180日 / 1年 / 全期間
- **種目**: 全種目 or 特定種目を選択

---

## 9. セキュリティポリシー

### 9.1 認証・認可

- Supabase Auth（JWT）を使用。MFA を必須化（TOTP）
- アクセストークン有効期限: 1時間 / リフレッシュトークン: 30日
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` のみフロントエンドに公開（RLS で保護）
- `SUPABASE_SERVICE_ROLE_KEY` はフロントエンドに含めない。Server Actions 内のみで使用

### 9.2 通信・ヘッダー

```typescript
// next.config.ts
const nextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js 要件
            "style-src 'self' 'unsafe-inline'",
            "connect-src 'self' https://*.supabase.co",
          ].join("; "),
        },
      ],
    },
  ],
};
export default nextConfig;
```

### 9.3 依存関係管理

#### ⏱ 7日間クールタイムポリシー

**新しいパッケージバージョンが公開されてから7日間は採用しない。**

> **背景**: xz-utils バックドア事件（CVE-2024-3094）等のサプライチェーン攻撃対策。公開直後に仕込まれた悪意あるコードをコミュニティが検出するまでの時間を確保する。

```
新バージョン公開
      ↓
   7日間待機（コミュニティ・セキュリティ研究者による検証期間）
      ↓
   CVE・インシデント未報告を確認
      ↓
   採用可
```

**例外**: 既知の CVE を修正するセキュリティパッチは即時適用を検討するが、diff を必ず確認してから適用すること。

#### 🔍 セキュリティ監査（OSV Scanner）

Bun は現時点で `npm audit` に相当する安定したネイティブコマンドを持たないため、**Google OSV Scanner** を使用する。

```bash
# OSV Scanner インストール（バイナリ版 - Go 不要）
# https://github.com/google/osv-scanner/releases から対応バイナリを取得

# 監査実行（bun.lockb を対象）
osv-scanner --lockfile bun.lockb

# package.json を対象にする場合
osv-scanner --lockfile package.json
```

GitHub Actions での定期実行設定:

```yaml
# .github/workflows/security-audit.yml
name: Security Audit
on:
  schedule:
    - cron: '0 9 * * 1'   # 毎週月曜 9:00 UTC
  push:
    paths:
      - 'bun.lockb'
      - 'package.json'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run OSV Scanner
        uses: google/osv-scanner-action@v1
        with:
          scan-args: |-
            --lockfile=bun.lockb
```

#### 🤖 Dependabot 設定

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"   # BunのpackageはnpmEコシステムとして認識される
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

### 9.4 環境変数管理

- ローカル: `.env.local`（`.gitignore` に必ず追加）
- 本番: Vercel Dashboard の Environment Variables で管理
- GitHub の **Secret Scanning** を有効化してシークレットの誤コミットを防止

---

## 10. インフラ構成・コスト

```
[ユーザー (Browser)]
        |  HTTPS
        ↓
[Vercel - Hobby Plan ($0)]
  Next.js 14 App Router
  Server Actions (BFF レイヤー)
        |
        ↓
[Supabase - Free Plan ($0)]
  PostgreSQL (500MB)
  Auth (JWT + MFA)
  Row Level Security
```

| サービス | プラン | 月額 | 主な無料枠 |
|---|---|---|---|
| Vercel | Hobby | $0 | 帯域 100GB/月 |
| Supabase | Free | $0 | DB 500MB / 50万リクエスト |
| **合計** | | **$0** | |

**スケールアップ判断基準**:
- DB が 500MB を超えたら → Supabase Pro（$25/月）
- ビルド時間・帯域が逼迫したら → Vercel Pro（$20/月）

---

## 11. 環境変数定義

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...       # ブラウザに公開可（RLS で保護）
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # 非公開。Server Actions 内のみ使用
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` に絶対に `NEXT_PUBLIC_` プレフィックスを付けない。

---

## 12. ディレクトリ構成

```
.
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      ← リダイレクト処理
│   ├── login/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── log/
│   │   ├── page.tsx                  ← カレンダー一覧
│   │   ├── new/
│   │   │   └── page.tsx              ← 記録入力
│   │   └── [date]/
│   │       └── page.tsx              ← 記録詳細・編集
│   ├── presets/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   └── exercises/
│       └── page.tsx
├── components/
│   ├── ui/                           ← shadcn/ui コンポーネント
│   ├── charts/                       ← Recharts ラッパーコンポーネント
│   ├── forms/                        ← 入力フォーム群
│   └── layout/                       ← ヘッダー・ナビゲーション
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← ブラウザ用クライアント
│   │   ├── server.ts                 ← Server Actions 用クライアント
│   │   └── database.types.ts         ← supabase gen types で自動生成
│   ├── actions/                      ← Server Actions
│   │   ├── workout.ts
│   │   ├── preset.ts
│   │   └── exercise.ts
│   └── utils/
│       └── metrics.ts                ← ダッシュボード指標計算ロジック
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       └── security-audit.yml
├── .env.local                        ← gitignore 対象
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── components.json                   ← shadcn/ui 設定
└── package.json
```

---

## 13. 開発フェーズ

### Phase 1 — MVP（目安: 2〜3週間）

- [ ] Bun + Next.js 14 + Supabase のセットアップ
- [ ] ログイン / ログアウト（MFA 含む）
- [ ] 種目マスタ CRUD
- [ ] 手動でのトレーニング記録入力
- [ ] 記録一覧・詳細表示

### Phase 2 — プリセット・UX改善（目安: 1〜2週間）

- [ ] プリセット CRUD
- [ ] プリセットからの一括入力展開
- [ ] 前回値の自動補完
- [ ] カレンダービュー実装

### Phase 3 — ダッシュボード（目安: 2週間）

- [ ] 最大重量推移グラフ（折れ線）
- [ ] ボリューム推移グラフ（棒）
- [ ] 頻度ヒートマップ
- [ ] 自己ベスト（PR）カード
- [ ] 部位別割合グラフ（ドーナツ）
- [ ] 期間・種目フィルター

---

## 14. 制約・注意事項

### Bun 固有の注意点

| 項目 | 内容 |
|---|---|
| **コマンド** | `npm` → `bun`、`npx` → `bunx`、ロックファイルは `bun.lockb`（バイナリ） |
| **CI** | `bun install --frozen-lockfile` でロックファイルを固定 |
| **`bun audit`** | 安定版が存在しないため OSV Scanner を使用すること |
| **Prisma** | Bun との相性問題の報告例あり。本プロジェクトでは Supabase JS SDK + 型自動生成で代替するため **Prisma は不採用** |
| **shadcn/ui** | `bunx shadcn@latest init` で初期化可能。Bun 動作確認済み |
| **Recharts / React Hook Form / Zod / date-fns** | Bun 動作確認済み |
| **Node.js API 互換** | Bun は Node.js API の大部分を実装しているが、一部未対応 API が存在する可能性あり。[公式互換性リスト](https://bun.sh/docs/runtime/nodejs-apis)を参照 |

### セキュリティに関する追加留意事項

- **新規パッケージ追加時は7日間クールタイムを遵守**（Section 9.3 参照）
- `SERVICE_ROLE_KEY` は Server Actions 内のみで使用し、クライアントコンポーネントには絶対に渡さない
- Supabase の `gen types` コマンドで型定義を自動生成し、型安全なDBアクセスを維持する

```bash
# 型定義の自動生成コマンド
bunx supabase gen types typescript --project-id <project-id> > lib/supabase/database.types.ts
```

---

*作成日: 2025年 / ステータス: 実装委託用 確定版*
