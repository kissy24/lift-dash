# [ISSUE-017] Security Audit脆弱性対応

## 概要

週次Security Auditで検出された`bun.lock`内の既知脆弱性を、直接依存の更新と最小範囲のoverridesで解消する。

## 背景・目的

2026-07-27のGitHub Actions `Security Audit`（run `30265879859`）が、8パッケージ・19件の既知脆弱性を検出して失敗した。直接依存と推移依存を修正版へ更新し、再現可能なlockfileとグリーンなCIを復旧する必要がある。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `next`と`eslint-config-next`が脆弱性修正版へ同一バージョンで更新されている
- [ ] `postcss`と脆弱な推移依存が修正版へ更新されている
- [ ] `bun.lock`から検出対象の脆弱バージョンが除去されている
- [ ] `bun install --frozen-lockfile`が成功する
- [ ] OSV Scannerで既知脆弱性が検出されない
- [ ] `bun run type-check`、`bun run lint`、`bun run test:run`、`bun run build`が成功する
- [ ] GitHub ActionsのQualityとSecurity Auditが成功する
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- `next`と`eslint-config-next`を`15.5.19`から`15.5.21`へ更新する
- 既存の`postcss`直接依存とoverrideを`8.5.18`以上の安全なバージョンへ更新する
- 親パッケージの互換範囲で解消できない`brace-expansion`、`fast-uri`、`js-yaml`、`sharp`のみ、修正版へ最小範囲でoverrideする
- Bunで`bun.lock`を再生成し、脆弱バージョンが残っていないことを確認する
- 公開7日未満のセキュリティ修正版は、要求仕様9.3の例外として公開tarball差分とintegrityを確認して適用する
- 作業結果とCI復旧経緯を`docs/works/ISSUE-017_security-audit-remediation.md`へ記録する

## 関連ファイル（予定）

- `package.json`
- `bun.lock`
- `commitlint.config.cjs`
- `docs/works/ISSUE-017_security-audit-remediation.md`

## 依存 Issue

- ISSUE-013（完了済み）

## 見積もり

- [x] Small（〜2h）
- [ ] Medium（〜1日）
- [ ] Large（〜3日）
