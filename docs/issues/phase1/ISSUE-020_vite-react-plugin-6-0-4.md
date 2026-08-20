# [ISSUE-020] Vite Reactプラグイン6.0.4更新

## 概要

最新`main`を基準に`@vitejs/plugin-react`を`6.0.3`から`6.0.4`へ更新し、Vite/Vitestツールチェーンの互換性を再検証する。

## 背景・目的

Dependabot PR #53は旧`main`上で5系から6系へ更新する内容のため競合している。現在はISSUE-018でVite 8とplugin-react 6.0.3への移行が完了しており、実質的な更新は6.0.3から6.0.4へのpatch更新となる。固定バージョン回帰テストを先に更新してRedを確認し、lockfileを最新`main`から再生成する。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `@vitejs/plugin-react`が`6.0.4`で固定されている
- [ ] `vite 8.1.5`、`vitest 4.1.10`、`@vitest/coverage-v8 4.1.10`とのpeer dependency整合性が維持されている
- [ ] ツールチェーン整合性テストが更新後の構成を検証している
- [ ] `bun install --frozen-lockfile`でlockfile差分が発生しない
- [ ] `bun run type-check`、`bun run lint`、`bun run test:run`、`bun run test:coverage`、`bun run build`が成功する
- [ ] OSV Scannerで既知脆弱性が検出されない
- [ ] GitHub ActionsのQualityとSecurity Auditが成功する
- [ ] Dependabot PR #53に後継PRを案内してクローズする
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- `lib/dependencies/toolchain-alignment.test.ts`の期待値を先に変更してRedを確認する
- `@vitejs/plugin-react 6.0.4`のpeer dependencyであるVite 8系を維持する
- 2026-07-22公開のため、2026-08-17時点で7日間クールタイムを満たしている

## 関連ファイル（予定）

- `package.json`
- `bun.lock`
- `lib/dependencies/toolchain-alignment.test.ts`
- `docs/works/ISSUE-020_vite-react-plugin-6-0-4.md`

## 依存 Issue

- ISSUE-019（先に完了が必要）

## 見積もり

- [x] Small（〜2h）
- [ ] Medium（〜1日）
- [ ] Large（〜3日）
