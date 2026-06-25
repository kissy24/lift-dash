# LiftDash 開発ルール・規約

**対象エージェント**: Codex CLI
**参照ドキュメント**: `LiftDash_requirements.md`
**バージョン**: 1.0

---

## 目次

1. エージェント動作原則
2. Issue ドリブン開発
3. ブランチ戦略（GitHub Flow）
4. コミット規約（Conventional Commits）
5. TDD 開発フロー
6. テスト規約
7. pre-commit フック
8. コード品質規約
9. Next.js 固有ルール
10. セキュリティルール
11. PR テンプレート
12. GitHub CLI 活用例
13. ディレクトリ・ファイル命名規則
14. エラーハンドリング規約

---

## 1. エージェント動作原則

### 1.1 Plan モードの必須実行

**実装着手前に必ず Plan モードを実行すること。**

Plan モードでやること（この順番で）:

```
① LiftDash_requirements.md を読み込む
       ↓
② 実装対象フェーズの全タスクを洗い出す
       ↓
③ docs/issues/ 配下に Issue ファイルを生成する（後述）
       ↓
④ GitHub CLI で GitHub 上に Issue を登録する
       ↓
⑤ 実装順序・依存関係を整理して実装計画を出力する
       ↓
⑥ ユーザーの承認を得てから Act モードに移行する
```

> Plan モードをスキップして実装を開始してはならない。

### 1.2 サブエージェントによるコミット前確認

コミット前に**必ず**以下の検証をサブエージェントとして実行し、全項目グリーンであることを確認してからコミットすること。

```bash
# 検証スクリプト（エージェントが実行する）
bun run type-check   # TypeScript 型チェック
bun run lint         # ESLint
bun run test:run     # Vitest（全テスト）
```

いずれか1つでも失敗した場合はコミットを中断し、修正してから再検証する。

### 1.3 エージェントが守るその他の原則

- 1 Issue = 1 ブランチ = 1 PR の単位で実装する
- 実装中に仕様の曖昧さを発見した場合は実装を止め、ユーザーに確認する
- ファイルの大量削除・既存テストの削除は必ずユーザーの承認を得る
- `main` ブランチへの直接コミットは禁止

---

## 2. Issue ドリブン開発

### 2.1 Issue ファイルの配置

```
docs/issues/
├── phase1/
│   ├── ISSUE-001_project-setup.md
│   ├── ISSUE-002_authentication.md
│   ├── ISSUE-003_exercise-master-crud.md
│   ├── ISSUE-004_workout-log-input.md
│   └── ISSUE-005_log-list-detail.md
├── phase2/
│   ├── ISSUE-006_preset-crud.md
│   ├── ISSUE-007_bulk-input-from-preset.md
│   ├── ISSUE-008_previous-value-autocomplete.md
│   └── ISSUE-009_calendar-view.md
└── phase3/
    ├── ISSUE-010_dashboard-charts.md
    ├── ISSUE-011_pr-card.md
    └── ISSUE-012_filters.md
```

### 2.2 Issue ファイルのテンプレート

```markdown
# [ISSUE-XXX] タイトル

## 概要
<!-- 何を実装するか1〜2文で -->

## 背景・目的
<!-- なぜ必要か -->

## 受け入れ条件 (Acceptance Criteria)
- [ ] 条件1
- [ ] 条件2
- [ ] 対応するテストがすべてグリーン

## 技術詳細
<!-- 実装方針・使用するコンポーネント・APIなど -->

## 関連ファイル（予定）
- `app/xxx/page.tsx`
- `lib/actions/xxx.ts`

## 依存 Issue
- ISSUE-XXX（先に完了が必要）

## 見積もり
- [ ] Small（〜2h）
- [ ] Medium（〜1日）
- [ ] Large（〜3日）
```

### 2.3 GitHub CLI で Issue を登録する

```bash
# Issue ファイルから GitHub Issue を作成
gh issue create \
  --title "[ISSUE-001] プロジェクトセットアップ" \
  --body-file docs/issues/phase1/ISSUE-001_project-setup.md \
  --label "phase1,enhancement"

# Issue 一覧確認
gh issue list

# Issue をブランチと紐付け（後述）
gh issue develop 1 --name "feat/ISSUE-001_project-setup"
```

---

## 3. ブランチ戦略（GitHub Flow）

### 3.1 ルール

| ブランチ | 役割 | 直接 push |
|---|---|---|
| `main` | 常にデプロイ可能な状態を維持 | **禁止** |
| `feat/ISSUE-XXX_xxx` | 新機能実装 | OK（PR経由でmainへ） |
| `fix/ISSUE-XXX_xxx` | バグ修正 | OK（PR経由でmainへ） |
| `chore/ISSUE-XXX_xxx` | 設定・依存関係更新 | OK（PR経由でmainへ） |
| `docs/ISSUE-XXX_xxx` | ドキュメント更新 | OK（PR経由でmainへ） |

### 3.2 ブランチ命名規則

```
<type>/ISSUE-<番号>_<短い説明>

例:
  feat/ISSUE-002_authentication
  fix/ISSUE-007_preset-bulk-input
  chore/ISSUE-001_project-setup
  docs/ISSUE-000_update-readme
```

### 3.3 作業フロー

```bash
# 1. main を最新化
git checkout main
git pull origin main

# 2. Issue ブランチを切る
git checkout -b feat/ISSUE-002_authentication

# 3. 実装（TDDで）

# 4. サブエージェント検証（コミット前に必ず実行）
bun run type-check && bun run lint && bun run test:run

# 5. コミット（Conventional Commits 形式）
git add .
git commit -m "feat(auth): implement login with Supabase Auth (#2)"

# 6. push
git push origin feat/ISSUE-002_authentication

# 7. PR 作成
gh pr create --fill

# 8. マージ後にブランチ削除
gh pr merge --squash --delete-branch
```

---

## 4. コミット規約（Conventional Commits）

### 4.1 形式

```
<type>(<scope>): <subject> (#<issue番号>)

[任意の本文]

[任意のフッター]
```

### 4.2 type 一覧

| type | 用途 |
|---|---|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `test` | テストの追加・修正 |
| `refactor` | 機能変更を伴わないリファクタリング |
| `chore` | ビルド・依存関係・設定変更 |
| `docs` | ドキュメントのみの変更 |
| `style` | コードの意味に影響しない変更（空白・フォーマット等） |
| `perf` | パフォーマンス改善 |
| `ci` | CI/CD 設定の変更 |
| `revert` | コミットの取り消し |

### 4.3 scope 一覧（本プロジェクト固有）

| scope | 対象 |
|---|---|
| `auth` | 認証関連 |
| `exercise` | 種目マスタ |
| `preset` | プリセット |
| `workout` | トレーニング記録 |
| `dashboard` | ダッシュボード |
| `log` | 記録一覧・詳細 |
| `db` | DBスキーマ・マイグレーション |
| `ci` | GitHub Actions |
| `deps` | 依存関係 |

### 4.4 コミット例

```bash
# 良い例
feat(auth): add MFA setup screen with TOTP support (#2)
fix(workout): correct volume calculation for multiple sets (#8)
test(preset): add unit tests for bulk input validation (#7)
chore(deps): update next.js to 14.2.x (#0)
refactor(dashboard): extract chart components to separate files (#10)

# 悪い例（禁止）
fix: bug fix          # 何のバグか不明
WIP                   # WIPコミットを main に入れない
update files          # 具体性がない
```

### 4.5 Breaking Change の表記

```bash
feat(db)!: rename workout_logs table to workout_sets (#5)

BREAKING CHANGE: テーブル名が変更された。マイグレーション必須。
```

### 4.6 commitlint の設定

```js
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['auth', 'exercise', 'preset', 'workout', 'dashboard', 'log', 'db', 'ci', 'deps'],
    ],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 200],
  },
}
```

---

## 5. TDD 開発フロー

### 5.1 Red → Green → Refactor サイクル

```
① テストを書く（この時点でテストは失敗する = Red）
       ↓
② テストをパスする最小限のコードを書く（= Green）
       ↓
③ コードを整理・最適化する（= Refactor）
       ↓
④ 全テストがグリーンのままであることを確認
       ↓
⑤ サブエージェント検証 → コミット
```

> テストより先に実装コードを書いてはならない。

### 5.2 TDD の適用範囲

| 対象 | テスト種別 | 必須度 |
|---|---|---|
| Server Actions | ユニットテスト | **必須** |
| ユーティリティ関数（metrics.ts など） | ユニットテスト | **必須** |
| フォームバリデーション（Zod スキーマ） | ユニットテスト | **必須** |
| UI コンポーネント | コンポーネントテスト | **必須** |
| ページコンポーネント | 統合テスト | 推奨 |
| DB クエリ・RLS | Supabase ローカルでのテスト | 推奨 |

---

## 6. テスト規約

### 6.1 テストスタック

| 役割 | ツール |
|---|---|
| テストランナー | **Vitest**（Bun 互換・高速） |
| コンポーネントテスト | **React Testing Library** |
| Supabase モック | `@supabase/supabase-js` のモック or vitest の `vi.mock()` |
| HTTP モック | **MSW（Mock Service Worker）** |

### 6.2 セットアップファイル

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules', '.next', 'vitest.config.ts'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Supabase クライアントのモック
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn(), signIn: vi.fn(), signOut: vi.fn() },
    from: vi.fn(() => ({ select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn() })),
  })),
}))
```

### 6.3 テストファイルの配置

```
コンポーネントのテストはコンポーネントと同階層に置く（colocate）

components/forms/WorkoutForm.tsx
components/forms/WorkoutForm.test.tsx   ← ここ

lib/actions/workout.ts
lib/actions/workout.test.ts             ← ここ

lib/utils/metrics.ts
lib/utils/metrics.test.ts              ← ここ
```

### 6.4 テストの書き方

```typescript
// lib/utils/metrics.test.ts の例
import { describe, it, expect } from 'vitest'
import { calcVolume, findPersonalRecord } from './metrics'

describe('calcVolume', () => {
  it('重量・レップ数の積を返す', () => {
    expect(calcVolume({ weight: 60, reps: 10 })).toBe(600)
  })

  it('重量が0のとき0を返す', () => {
    expect(calcVolume({ weight: 0, reps: 10 })).toBe(0)
  })
})
```

### 6.5 カバレッジ目標

| 対象 | 目標カバレッジ |
|---|---|
| `lib/utils/` | **90%以上** |
| `lib/actions/` | **80%以上** |
| `components/` | **70%以上** |

```bash
# カバレッジレポートの確認
bun run test:coverage
```

### 6.6 package.json のスクリプト定義

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "prepare": "husky"
  }
}
```

---

## 7. pre-commit フック

husky + lint-staged を使用する。

> **Deno / npm 不使用のため husky を採用。** `pre-commit`（Python製）は不採用。

### 7.1 初期設定

```bash
# husky のセットアップ
bunx husky init

# lint-staged のインストール
bun add -d lint-staged @commitlint/cli @commitlint/config-conventional
```

### 7.2 フックファイル

```bash
# .husky/pre-commit
#!/bin/sh
# 1. lint-staged でステージ済みファイルのチェック
bunx lint-staged

# 2. サブエージェント検証（型チェック + 全テスト）
echo "🤖 Running sub-agent verification..."
bun run type-check || { echo "❌ Type check failed"; exit 1; }
bun run test:run   || { echo "❌ Tests failed"; exit 1; }
echo "✅ All checks passed"
```

```bash
# .husky/commit-msg
#!/bin/sh
# Conventional Commits の形式チェック
bunx --no -- commitlint --edit $1
```

### 7.3 lint-staged の設定

```json
// package.json 内
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "bunx eslint --fix --max-warnings=0",
      "bunx prettier --write"
    ],
    "*.{json,md,css,yaml,yml}": [
      "bunx prettier --write"
    ]
  }
}
```

### 7.4 フックで検証する内容

| フック | 検証内容 | 失敗時の動作 |
|---|---|---|
| `pre-commit` | ESLint, Prettier, 型チェック, 全テスト | コミット中断 |
| `commit-msg` | Conventional Commits 形式 | コミット中断 |

> ⚠️ `git commit --no-verify` での回避は禁止。

---

## 8. コード品質規約

### 8.1 TypeScript 設定

```json
// tsconfig.json（strict モードを必ず有効化）
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**禁止事項:**
- `any` 型の使用（`unknown` に置き換える）
- `// @ts-ignore` の使用（`// @ts-expect-error` + 理由コメントならOK）
- 型アサーション（`as Type`）の多用

### 8.2 ESLint 設定

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling"],
        "newlines-between": "always"
      }
    ]
  }
}
```

### 8.3 Prettier 設定

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 8.4 命名規則

| 対象 | 規則 | 例 |
|---|---|---|
| コンポーネントファイル | PascalCase | `WorkoutForm.tsx` |
| その他ファイル | kebab-case | `use-workout.ts` |
| ルートセグメント | kebab-case | `app/log/new/page.tsx` |
| コンポーネント関数 | PascalCase | `function WorkoutForm()` |
| 変数・関数 | camelCase | `const workoutSets` |
| 定数 | UPPER_SNAKE_CASE | `const MAX_SETS = 10` |
| 型・インターフェース | PascalCase | `type WorkoutSet` |
| Zod スキーマ | camelCase + Schema | `const workoutSetSchema` |
| Server Actions | camelCase + Action | `async function createWorkoutAction()` |

### 8.5 import 順序

```typescript
// 1. Node.js 組み込み
import path from 'path'

// 2. 外部ライブラリ
import { useState } from 'react'
import { z } from 'zod'

// 3. 内部モジュール（@/ エイリアス）
import { createClient } from '@/lib/supabase/client'
import { WorkoutForm } from '@/components/forms/WorkoutForm'

// 4. 型のみ import
import type { WorkoutSet } from '@/lib/supabase/database.types'
```

### 8.6 .editorconfig

```ini
# .editorconfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

---

## 9. Next.js 固有ルール

### 9.1 Server Components / Client Components の使い分け

```typescript
// ✅ デフォルトは Server Component（'use client' なし）
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchDashboardData()  // サーバーサイドで直接 DB アクセス
  return <Dashboard data={data} />
}

// ✅ インタラクションが必要な場合のみ 'use client'
// components/forms/WorkoutForm.tsx
'use client'
import { useState } from 'react'
export function WorkoutForm() { ... }
```

**判断基準:**
- `useState`, `useEffect`, イベントハンドラが必要 → `'use client'`
- データフェッチのみ → Server Component
- `'use client'` は可能な限り末端のコンポーネントに閉じ込める

### 9.2 Server Actions

```typescript
// lib/actions/workout.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { workoutSessionSchema } from '@/lib/validations/workout'

export async function createWorkoutSessionAction(formData: FormData) {
  // 1. 認証チェック（必須）
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // 2. 入力バリデーション（Zod）
  const parsed = workoutSessionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }

  // 3. DB 操作
  const { error } = await supabase.from('workout_sessions').insert(parsed.data)
  if (error) return { error: { message: error.message } }

  // 4. キャッシュ更新
  revalidatePath('/log')
  return { success: true }
}
```

**Server Actions のルール:**
- 必ず最初に認証チェックを行う
- 入力は必ず Zod でバリデーションする
- `SUPABASE_SERVICE_ROLE_KEY` が必要な操作のみ `server.ts` クライアントを使う
- 戻り値は `{ success: true }` または `{ error: ... }` の統一形式

### 9.3 Supabase クライアントの使い分け

```typescript
// lib/supabase/client.ts  → ブラウザ用（Client Components）
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts  → Server Components / Server Actions 用
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // ← RLS が効くので通常はこちら
    { cookies: { getAll: () => cookieStore.getAll(), ... } }
  )
}
```

> `SUPABASE_SERVICE_ROLE_KEY`（RLS バイパス）は管理目的のスクリプトのみに限定し、通常の Server Actions では使用しない。

### 9.4 環境変数のアクセスルール

```typescript
// ✅ 正しい使い方
// Server 側のみ
process.env.SUPABASE_SERVICE_ROLE_KEY

// Client / Server 両方から使える
process.env.NEXT_PUBLIC_SUPABASE_URL

// ❌ 禁止
// Client Component 内で SERVICE_ROLE_KEY を参照・渡すことは絶対禁止
```

### 9.5 データフェッチのルール

- ページレベルのデータフェッチは Server Component で行う
- Client Component からの Supabase アクセスは読み取り（RLS保護下）のみ
- 書き込みは必ず Server Actions 経由

---

## 10. セキュリティルール

### 10.1 依存パッケージの更新ルール（7日間クールタイム）

`LiftDash_requirements.md` のセクション 9.3 を参照。以下を必ず守ること:

- 新しいパッケージバージョンが公開されてから**7日間は採用しない**
- 新規パッケージ追加時は npm のリリース日を確認する

```bash
# リリース日の確認方法
bunx npm view <package-name> time --json | head -30
```

- Dependabot の PR は7日間クールタイムを過ぎてからマージする
- セキュリティパッチは例外だが、必ず diff を確認してからマージする

### 10.2 シークレット管理ルール

- `.env.local` は **絶対にコミットしない**（`.gitignore` に記載済みであることを初回確認）
- コード内にシークレットをハードコードしない
- `console.log` でシークレットや認証トークンを出力しない
- PR のコード差分にシークレットが含まれていないか確認してからマージする

### 10.3 OSV Scanner の実行（セキュリティ監査）

```bash
# 手動実行（新しいパッケージ追加後に必ず実行）
osv-scanner --lockfile bun.lockb
```

CI（GitHub Actions）で週次自動実行される（`LiftDash_requirements.md` のワークフロー参照）。

### 10.4 `console.log` の禁止

本番コードでの `console.log` は ESLint で警告。デバッグ用ログは必ず削除してからコミットする。

```typescript
// ✅ 許可
console.warn('Unexpected state:', state)
console.error('Failed to fetch:', error)

// ❌ 禁止（ESLint が検知）
console.log('debug:', data)
```

---

## 11. PR テンプレート

```markdown
<!-- .github/pull_request_template.md -->

## 概要
<!-- この PR で何をしたか -->

## 関連 Issue
Closes #<issue番号>

## 変更内容
- [ ] 機能追加
- [ ] バグ修正
- [ ] リファクタリング
- [ ] テスト追加
- [ ] ドキュメント更新

## チェックリスト
- [ ] `bun run type-check` がパスしている
- [ ] `bun run lint` がパスしている（warnings 0）
- [ ] `bun run test:run` が全てグリーン
- [ ] 新機能にはテストを追加した
- [ ] セキュリティ: シークレットがコードに含まれていない
- [ ] セキュリティ: 新しい依存パッケージは7日間クールタイムを確認した
- [ ] `console.log` を残していない

## スクリーンショット（UI変更がある場合）

## 補足
```

---

## 12. GitHub CLI 活用例

```bash
# === Issue 操作 ===

# Issue 作成
gh issue create --title "feat: ログイン画面の実装" --body-file docs/issues/phase1/ISSUE-002_authentication.md --label "phase1,feat"

# Issue 一覧
gh issue list --label "phase1"

# Issue をブラウザで開く
gh issue view 2 --web

# Issue にコメント
gh issue comment 2 --body "実装開始します"

# === PR 操作 ===

# PR 作成（ブランチ上で実行）
gh pr create --fill

# PR 一覧
gh pr list

# PR のレビュー状況確認
gh pr status

# PR をマージ（Squash & Delete ブランチ）
gh pr merge --squash --delete-branch

# === その他 ===

# Actions の実行状況確認
gh run list

# Actions のログ確認
gh run view --log

# リリース作成
gh release create v1.0.0 --generate-notes
```

---

## 13. ディレクトリ・ファイル命名規則

### 13.1 ファイル名

```
app/ 配下のルートファイル  → Next.js 規約に従う（kebab-case）
  app/log/new/page.tsx
  app/presets/[id]/page.tsx

コンポーネントファイル     → PascalCase
  components/forms/WorkoutForm.tsx
  components/charts/VolumeChart.tsx

ライブラリファイル         → kebab-case
  lib/utils/calc-metrics.ts
  lib/hooks/use-workout-form.ts

テストファイル             → 対象ファイルと同名 + .test.ts(x)
  WorkoutForm.test.tsx
  calc-metrics.test.ts
```

### 13.2 コンポーネントのエクスポート規則

```typescript
// ✅ named export を基本とする（コンポーネント）
export function WorkoutForm() { ... }

// ✅ Next.js のページ・レイアウトは default export
export default function WorkoutPage() { ... }

// ❌ 匿名 default export は禁止
export default function() { ... }
```

---

## 14. エラーハンドリング規約

### 14.1 Server Actions のエラー返却

```typescript
// 統一された戻り値型
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: { message: string; fields?: Record<string, string[]> } }

// 使用例
export async function createExerciseAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    // ...
    return { success: true, data: { id: result.id } }
  } catch (e) {
    return { success: false, error: { message: 'サーバーエラーが発生しました' } }
  }
}
```

### 14.2 Client 側のエラー表示

```typescript
// useActionState（React 19 / Next.js 14）を使用
const [state, action] = useActionState(createExerciseAction, null)

// エラー表示は toast または フォームインライン表示とする
```

### 14.3 エラーバウンダリ

- `app/error.tsx` でページレベルのエラーをキャッチする
- 想定外のエラーは `console.error` でログを残す（`console.log` は禁止）

---

## Appendix: セットアップコマンド早見表

```bash
# リポジトリ初期化後の初回セットアップ
bun install                          # 依存関係インストール
bunx husky init                      # husky 初期化
bunx shadcn@latest init              # shadcn/ui 初期化

# 型定義の再生成（Supabase スキーマ変更後）
bunx supabase gen types typescript \
  --project-id <project-id> \
  > lib/supabase/database.types.ts

# 日常的なコマンド
bun run dev                          # 開発サーバー起動
bun run type-check                   # 型チェック
bun run lint                         # Lint
bun run test                         # テスト（ウォッチモード）
bun run test:run                     # テスト（1回実行）
bun run test:coverage                # カバレッジ

# セキュリティ監査
osv-scanner --lockfile bun.lockb
```

---

*作成日: 2025年 / ステータス: Codex CLI 実装委託用 確定版*
