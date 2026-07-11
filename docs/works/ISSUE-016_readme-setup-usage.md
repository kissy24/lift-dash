# [ISSUE-016] READMEセットアップ・利用ガイド 作業記録

## 対象

- GitHub Issue: #44
- PR: 作成後に追記
- ブランチ: `docs/ISSUE-016_readme-setup-usage`

## 実施日

- 2026-07-12

## 実施内容

- READMEへプロダクト概要、主要機能、技術スタックを追加した
- Bun、Node.js、Supabase、Supabase CLI、TOTP認証アプリの前提条件を追加した
- 依存関係、Supabaseプロジェクト、migration、環境変数、開発サーバーのセットアップ手順を追加した
- Supabase Dashboardでの初期ユーザー作成と、初回ログイン後のTOTP登録手順を追加した
- 種目、プリセット、トレーニング記録、履歴、ダッシュボードの利用方法を追加した
- 開発・検証・OSV Scannerのコマンドとセキュリティ注意事項を追加した

## 発生した問題と対応

- アプリにサインアップ画面がないため、初期ユーザーはSupabase Dashboardで作成する必要があることを明記した
- remote databaseへのmigration適用は破壊的影響を持ち得るため、`supabase db push --dry-run`で確認してから適用する順序にした
- Supabase公式ドキュメントで`supabase link --project-ref`、`supabase db push --dry-run`、`supabase db push`の現行手順を確認した
- 通常動作にservice role keyは不要であり、publicなanon keyだけを利用することを明記した
- production buildが`next-env.d.ts`を更新したため、目的外の生成差分を除外した

## 主なコミット

- コミット後に追記

## 検証結果

- README / IssueのPrettier check: PASS
- ローカルリンク・参照先の存在確認: PASS
- `bun run type-check`: PASS
- `bun run lint`: PASS（ESLint warnings 0）
- `bun run test:run`: PASS（45 files / 167 tests）
- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key bun run build`: PASS
- GitHub Actions: PR作成後に確認

## 注意事項

- Supabase DashboardのUI名称は変更される可能性があるため、READMEから公式Auth・CLIドキュメントへリンクした
- `.env.local`、service role key、database passwordはcommitしない
- migration適用前に対象project refとdry-run結果を確認する
