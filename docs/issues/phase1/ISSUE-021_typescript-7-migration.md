# [ISSUE-021] TypeScript 7移行

## 概要

TypeScriptのCLI型検証を`7.0.2`へ更新し、Next.jsアプリのCSS副作用importをTypeScript 7互換にする。APIを必要とするNext.js 15とESLint向けにはTypeScript 6.0.3を併用する。

## 背景・目的

Dependabot PR #54は最新`main`と競合しており、更新を再現すると`app/layout.tsx`の`./globals.css`副作用importでTS2882が発生する。また、TypeScript 7.0は従来のJavaScript Compiler APIを同梱しないため、Next.js 15.5.21へ直接配置するとlint/buildが失敗する。型安全性を弱めず、TypeScript公式のside-by-side移行方針に沿ってCLIとAPI利用を分離する。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `@typescript/native`がTypeScript `7.0.2`へ固定され、`bun run type-check`がそのCLIを実行する
- [ ] Next.js/ESLint向けCompiler APIとしてTypeScript `6.0.3`が固定されている
- [ ] `app/layout.tsx`の`./globals.css`副作用importを含めて型チェックが成功する
- [ ] CSS importの型宣言または設定が必要最小限の範囲に限定されている
- [ ] `strict`、`noUncheckedIndexedAccess`、`noImplicitReturns`、`noFallthroughCasesInSwitch`、`exactOptionalPropertyTypes`が維持されている
- [ ] `bun install --frozen-lockfile`でlockfile差分が発生しない
- [ ] `bun run type-check`、`bun run lint`、`bun run test:run`、`bun run test:coverage`、`bun run build`が成功する
- [ ] OSV Scannerで既知脆弱性が検出されない
- [ ] GitHub ActionsのQualityとSecurity Auditが成功する
- [ ] Dependabot PR #54に後継PRを案内してクローズする
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- TypeScript 7でTS2882が再現することをRedとして確認する
- `noUncheckedSideEffectImports`を無効化するのではなく、CSS資産の型宣言を優先して検証する
- TypeScript 7.0はCompiler APIを持たないため、`@typescript/native`でCLIを配置し、`typescript`名にはNext.js 15.5.21が利用する6.0.3 APIを配置する
- `type-check`スクリプトは`@typescript/native/bin/tsc`を明示的に実行し、bin競合に依存しない
- Next.js 15.5.21の生成型と既存のstrict設定を維持する
- TypeScript 7.0.2は2026-07-08、TypeScript 6.0.3は2026-04-16公開のため、7日間クールタイムを満たしている

## 関連ファイル（予定）

- `package.json`
- `bun.lock`
- `global.d.ts`
- `lib/dependencies/`
- `docs/works/ISSUE-021_typescript-7-migration.md`

## 依存 Issue

- ISSUE-020（先に完了が必要）

## 見積もり

- [ ] Small（〜2h）
- [x] Medium（〜1日）
- [ ] Large（〜3日）
