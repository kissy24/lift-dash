# [ISSUE-014] Dependabot PRのBun lockfile自動更新

## 概要

Dependabot PRで`package.json`だけが更新され、`bun.lock`が追従せず`bun install --frozen-lockfile`でCIが失敗する問題を修正する。

## 背景・目的

Bun環境ではlockfileが更新されていない依存更新PRをマージすると、mainの再現可能な依存インストールが壊れる。Dependabot PRでlockfile更新を自動化し、Quality CIが安定して検証できる状態にする。

## 受け入れ条件 (Acceptance Criteria)

- [ ] 現在の`main`で発生している`bun install --frozen-lockfile`失敗が解消される
- [ ] Dependabot PRに対して`bun.lock`更新用workflowが実行される
- [ ] workflowはDependabot PRだけを対象にする
- [ ] lockfile更新は`bun install --lockfile-only --ignore-scripts`に限定する
- [ ] `bun.lock`に差分がある場合だけDependabot PRブランチへcommit/pushする
- [ ] 通常のQuality CIは引き続き`bun install --frozen-lockfile`で検証する
- [ ] 対応するテスト・検証がすべてグリーン

## 技術詳細

- `pull_request_target`イベントでDependabot PRを検出する
- `permissions.contents: write`を設定し、Dependabotブランチへlockfile修正commitをpushする
- `github.actor == 'dependabot[bot]'`と`head.repo.full_name == github.repository`を条件にして対象を制限する
- script実行リスクを避けるため`--ignore-scripts`を付ける
- lockfileに差分がない場合はcommitしない

## 関連ファイル（予定）

- `.github/workflows/dependabot-bun-lockfile.yml`
- `bun.lock`
- `docs/works/ISSUE-014_dependabot-bun-lockfile.md`

## 依存 Issue

- ISSUE-013（先に完了が必要）

## 見積もり

- [x] Small（〜2h）
- [ ] Medium（〜1日）
- [ ] Large（〜3日）
