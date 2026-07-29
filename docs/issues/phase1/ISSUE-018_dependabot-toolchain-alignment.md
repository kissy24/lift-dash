# [ISSUE-018] Dependabot開発ツール依存の整合化

## 概要

単独では競合または互換性エラーが発生するDependabot PR #17、#18、#46、#47を、互換性のあるバージョン構成へまとめて更新する。

## 背景・目的

2026-07-28のレビューで、4件のDependabot PRはいずれも現在のままではマージできないと判定した。Vite/Vitest系とcommitlint系は関連パッケージを同時に更新する必要があり、Node型は実行環境とmajorを揃える必要がある。最新`main`を基準に依存関係と`bun.lock`を再生成し、開発ツールチェーンを一貫した状態へ戻す。

## 受け入れ条件 (Acceptance Criteria)

- [x] `vite 8.1.5`、`@vitejs/plugin-react 6.0.3`、`vitest 4.1.10`、`@vitest/coverage-v8 4.1.10`が互換性のある組み合わせで固定されている
- [x] `@commitlint/cli 21.2.1`と`@commitlint/config-conventional 21.2.0`が同じ21.2系で固定されている
- [x] commit-msgフックが有効な設定と無効な設定を正しく判定する回帰テストが追加されている
- [x] `@types/node`はランタイム方針に合わせて24系の`24.13.3`へ更新されている
- [x] Dependabotが`@types/node`のsemver-major更新を作成しない設定になっている
- [x] Node.jsの開発要件がcommitlint 21の要件に合わせて`22.12.0`以上と明記されている
- [x] `bun install --frozen-lockfile`が成功し、`bun.lock`が再生成されない
- [x] `bun run type-check`、`bun run lint`、`bun run test:run`、`bun run test:coverage`、`bun run build`が成功する
- [x] OSV Scannerで既知脆弱性が検出されない
- [ ] GitHub ActionsのQualityとSecurity Auditが成功する
- [ ] 置き換え対象のDependabot PR #17、#18、#46、#47に後継PRを案内し、クローズする
- [x] 対応するテストがすべてグリーン

## 技術詳細

- Vite/Vitest系はmajorを個別更新せず、peer dependencyが一致する版を同時に更新する
- Vitestの通常テストに加えてcoverage providerの実動を検証する
- commitlintはCLIとpresetを同じ21.2系列へ揃え、`commitlint.config.cjs`の読み込みとcommit-msgフックを検証する
- Node 26へのランタイム移行は行わず、`@types/node`は24系を維持する
- 2026-07-28時点で、採用候補はすべて公開後7日以上経過している
- 最新`main`のセキュリティoverridesと`brace-expansion`互換パッチを維持したまま`bun.lock`を再生成する

## 関連ファイル（予定）

- `package.json`
- `bun.lock`
- `.github/dependabot.yml`
- `README.md`
- `vitest.config.mts`
- `commitlint.config.cjs`
- `lib/dependencies/`
- `docs/works/ISSUE-018_dependabot-toolchain-alignment.md`

## 依存 Issue

- ISSUE-017（完了済み）

## 見積もり

- [ ] Small（〜2h）
- [x] Medium（〜1日）
- [ ] Large（〜3日）
