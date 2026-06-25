# [ISSUE-001] プロジェクトセットアップ

## 概要

Bun + Next.js 14 + TypeScript のアプリ基盤を構築し、Tailwind CSS、shadcn/ui、Vitest、ESLint、Prettier、Husky を導入する。

## 背景・目的

LiftDash の MVP 開発を始めるため、App Router、テスト、品質チェック、セキュリティ監査の土台を先に整備する必要がある。

## 受け入れ条件 (Acceptance Criteria)

- [ ] Next.js 14 App Router プロジェクトが Bun で起動できる
- [ ] TypeScript strict 設定が有効である
- [ ] Tailwind CSS v3 と shadcn/ui の初期設定が完了している
- [ ] Vitest と React Testing Library のセットアップが完了している
- [ ] ESLint、Prettier、commitlint、lint-staged、Husky が設定されている
- [ ] `.env.local` が `.gitignore` 対象である
- [ ] PR テンプレート、Dependabot、OSV Scanner の GitHub Actions が設定されている
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- Bun をパッケージマネージャーとして使用する
- Next.js 14 App Router、React、TypeScript を導入する
- `vitest.config.ts` と `vitest.setup.ts` を作成し、jsdom と Testing Library を設定する
- `next.config.ts` にセキュリティヘッダーを設定する
- `package.json` に AGENTS.md 指定の scripts と lint-staged 設定を追加する

## 関連ファイル（予定）

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `vitest.config.ts`
- `vitest.setup.ts`
- `.eslintrc.json`
- `.prettierrc`
- `.editorconfig`
- `.gitignore`
- `.husky/pre-commit`
- `.husky/commit-msg`
- `.github/pull_request_template.md`
- `.github/dependabot.yml`
- `.github/workflows/security-audit.yml`

## 依存 Issue

- なし

## 見積もり

- [ ] Small（〜2h）
- [x] Medium（〜1日）
- [ ] Large（〜3日）
