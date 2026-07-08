# [ISSUE-010] ダッシュボードグラフ 作業記録

## 対象

- GitHub Issue: #33
- PR: 未作成
- ブランチ: `feat/ISSUE-010_dashboard-charts`

## 実施日

- 2026-07-08

## 実施内容

- Phase 3 のIssueファイルを追加し、GitHub Issue #32〜#34 を登録した
- `/dashboard` をServer Componentでトレーニング記録を取得する画面へ変更
- 最大重量推移、総ボリューム推移、頻度ヒートマップ、部位別割合、週次ボリュームの集計ロジックを追加
- Rechartsを使ったダッシュボードグラフ表示コンポーネントを追加
- 頻度ヒートマップは新規依存を追加せずCSS gridで実装
- 記録がない場合の空状態を各グラフに追加

## 発生した問題と対応

- Rechartsはjsdom上でレイアウト幅を取れないため、コンポーネントテストではRechartsをモックし、セクション表示・主要値・空状態を検証した
- グラフ系列の表示順がlocale依存にならないよう、集計結果は`exerciseId`順で安定化した

## 主なコミット

- 未コミット

## 検証結果

- 関連テスト:
  - `bun run test:run -- lib/workouts/dashboard-metrics.test.ts components/charts/DashboardCharts.test.tsx app/dashboard/page.test.tsx`: PASS
- `bun run type-check`: PASS
- `bun run lint`: PASS
- `bun run test:run`: PASS（41 files / 153 tests）
- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key bun run build`: PASS
- `osv-scanner scan source -L bun.lock`: PASS（794 packages / No issues found）
- GitHub Actions: 未実施

## 注意事項

- `next-env.d.ts` は Next.js の build / type-check で生成差分が出る場合があるため、目的外の差分としてコミットしない
