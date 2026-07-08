# [ISSUE-014] Dependabot PRのBun lockfile自動更新 作業記録

## 対象

- GitHub Issue: #36
- PR: 未作成
- ブランチ: `chore/ISSUE-014_dependabot-bun-lockfile`

## 実施日

- 2026-07-08

## 実施内容

- Dependabot PR #16 / #17 / #18 のQuality CI失敗ログを確認した
- 失敗原因が`bun install --frozen-lockfile`の`lockfile had changes`であることを確認した
- `main`にもDependabot PR #19由来の`package.json` / `bun.lock`不整合が入っていることを確認した
- `eslint-config-next@16.2.10`が`eslint >= 9`を要求しており、現行`eslint@8.57.1`と不整合なため`15.5.19`へ戻した
- `autoprefixer@10.5.2`は公開日が2026-06-24で7日間クールタイムを満たし、peer dependencyも現行構成と互換のため維持した
- `bun install --lockfile-only --ignore-scripts`で`bun.lock`を更新した
- Dependabot PR専用の`bun.lock`自動更新workflowを追加した

## 発生した問題と対応

- DependabotがBun lockfileを更新しないため、通常のQuality CIが正しく失敗していた
- 自動更新workflowは`pull_request_target`を使うため、対象を`dependabot[bot]`かつ同一リポジトリのブランチに限定した
- script実行リスクを避けるため、lockfile更新は`bun install --lockfile-only --ignore-scripts`に限定した

## 主なコミット

- 未コミット

## 検証結果

- `bun install --frozen-lockfile`: PASS
- `bun run type-check`: PASS
- `bun run lint`: PASS
- `bun run test:run`: PASS（41 files / 153 tests）
- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key bun run build`: PASS
- `osv-scanner scan source -L bun.lock`: PASS（793 packages / No issues found）
- GitHub Actions: 未実施

## 注意事項

- Dependabotの依存更新PRは、`bun.lock`更新が含まれていることをQuality CIで確認してからマージする
- `eslint-config-next`のmajor更新は、Next.js本体およびESLint major更新とセットで扱う
