# [ISSUE-001] プロジェクトセットアップ 作業記録

## 対象

- GitHub Issue: #1 `[ISSUE-001] プロジェクトセットアップ`
- PR: #6
- ブランチ: `chore/ISSUE-001_project-setup`

## 実施日

- 2026-06-25

## 実施内容

- Phase 1 の Issue ファイルを `docs/issues/phase1/` に作成した。
- GitHub CLI で Phase 1 の GitHub Issue を作成した。
- `chore/ISSUE-001_project-setup` ブランチを作成した。
- Next.js App Router の最小構成を追加した。
- Bun ベースの依存関係、テスト、lint、format、type-check を設定した。
- Vitest と React Testing Library のテスト環境を追加した。
- Tailwind CSS と shadcn/ui 用の基本設定を追加した。
- Husky、lint-staged、commitlint によるコミット前検証を追加した。
- GitHub Actions の OSV Scanner によるセキュリティ監査ワークフローを追加した。
- Dependabot 設定と PR テンプレートを追加した。

## GitHub Actions 対応

- 当初 `google/osv-scanner-action@v1` が存在しないタグ参照で失敗した。
- `v1.9.2` への変更では action 定義として利用できず、`runs` 不足で失敗した。
- `google/osv-scanner-action/.github/workflows/osv-scanner-reusable.yml@v2.3.8` の reusable workflow に切り替えた。
- `v2.3.8` は GitHub API でタグ実体とコミット日を確認し、7日間クールタイムを満たすことを確認した。
- OSV Scanner 実行後、`next` 経由で `postcss@8.4.31` が `bun.lock` に残っているため `CVE-2026-41305` が検出された。
- `next` と build 関連依存を更新した後も transitive dependency として `postcss@8.4.31` が残ったため、`package.json` の `overrides` で `postcss@8.5.15` に固定した。
- `bun.lock` から `next/postcss` と `postcss@8.4.31` が消えたことを確認した。

## Node.js 実行環境対応

- 当初 `/home/kissy24/.local/bin/node` が Bun への symlink だったため、Vitest が Node 互換問題で失敗した。
- 一時ディレクトリの Node バイナリを PATH に入れてコミットする案はセキュリティ上好ましくないと判断した。
- 公式 Node.js `node-v22.11.0-linux-x64.tar.xz` と `SHASUMS256.txt` を取得し、SHA256 を検証した。
- 検証済み Node.js を `/home/kissy24/.local/opt/node-v22.11.0-linux-x64` に展開し、`/home/kissy24/.local/bin/node` を実 Node.js へ向けた。

## 主なコミット

- `0d08317 chore(ci): initialize project setup (#1)`
- `82cb462 ci(ci): fix osv scanner action tag (#1)`
- `100a1ca ci(ci): trigger security audit workflow changes (#1)`
- `c6f46bb ci(ci): use osv scanner reusable workflow (#1)`
- `8d7ad68 fix(deps): update vulnerable build dependencies (#1)`
- `9dc8618 fix(deps): override vulnerable postcss transitive dependency (#1)`

## 検証結果

- `bun run type-check`: 成功
- `bun run lint`: 成功
- `bun run test:run`: 成功
- `bun run build`: 成功
- サブエージェントによるコミット前確認: 成功
- GitHub Actions `audit / osv-scan`: 成功
- GitHub Actions `osv-scanner`: 成功

## 注意事項

- `next build` 実行後に `next-env.d.ts` が自動更新される場合がある。
- 生成差分が今回の変更目的と無関係な場合は、コミット対象に含めない。
- OSV Scanner が失敗した場合は、SARIF artifact または Actions ログから脆弱な package/version と lockfile path を確認してから修正する。
