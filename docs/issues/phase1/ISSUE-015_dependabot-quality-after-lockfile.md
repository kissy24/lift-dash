# [ISSUE-015] Dependabot lockfile更新後のQuality検証

## 概要

Dependabot PRで`bun.lock`を自動更新した後、読み取り専用の通常Quality workflowを更新後のPRブランチに対して起動し、検証結果がPRに残るようCIを改善する。

## 背景・目的

ISSUE-014でDependabot PRの`bun.lock`自動更新を導入したが、`GITHUB_TOKEN`によるpushは別のGitHub Actions workflowを起動しない。そのためlockfile更新済みのコミットに通常のQuality workflowが実行されず、PR #17 / #18でQuality checkが表示されない状態になっている。lockfile更新後に通常のQuality workflowを明示的に起動し、安全に依存更新を判断できる状態にする。

## 受け入れ条件 (Acceptance Criteria)

- [ ] Dependabot PRの`bun.lock`更新後、更新後のhead branchに対して通常のQuality workflowが起動する
- [ ] Quality workflowで`bun install --frozen-lockfile`、型チェック、Lint、テスト、ビルドが実行される
- [ ] Quality workflowは`contents: read`のまま維持される
- [ ] lockfileに差分がないDependabot PRでも、必要に応じてQuality workflowを起動できる
- [ ] Dependabot用workflowの書き込み権限をlockfile更新とQuality workflowのdispatchに限定する
- [ ] Dependabot以外のPRから書き込み権限を利用できない既存の制限を維持する
- [ ] 対応するローカル検証がすべてグリーン

## 技術詳細

- `.github/workflows/quality.yml`に`workflow_dispatch`トリガーを追加する
- `.github/workflows/dependabot-bun-lockfile.yml`からlockfile更新後のhead branchを指定してQuality workflowをdispatchする
- Dependabot用workflowには`actions: write`を追加するが、依存インストールやPRコードの実行は行わない
- `pull_request_target`でPRブランチのコードを実行するため、Dependabot actorと同一repositoryのhead branchに限定する既存条件を維持する
- 通常PRと`main`向けのQualityトリガー、および`contents: read`権限は維持する

## 関連ファイル（予定）

- `.github/workflows/dependabot-bun-lockfile.yml`
- `.github/workflows/quality.yml`
- `docs/works/ISSUE-015_dependabot-quality-after-lockfile.md`

## 依存 Issue

- ISSUE-014（Dependabot PRのBun lockfile自動更新）

## 見積もり

- [x] Small（〜2h）
- [ ] Medium（〜1日）
- [ ] Large（〜3日）
