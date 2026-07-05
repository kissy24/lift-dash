# [ISSUE-005] 記録一覧・詳細表示 作業記録

## 対象

- GitHub Issue: #3 `[ISSUE-005] 記録一覧・詳細表示`
- PR: #23 `feat(log): add workout history management (#3)`
- ブランチ: `feat/ISSUE-005_log-list-detail`

## 実施日

- 2026-07-05

## 実施内容

- `/log`に日付別のセッション数、セット数、合計ボリューム一覧を追加した。
- `/log/[date]`に同日複数セッション、種目、セット詳細を追加した。
- セッション全体の編集・削除と、セット単位の重量・レップ編集・削除を追加した。
- セッション全体を1トランザクションで置換するsecurity invoker DB関数を追加した。
- 最終セットの単独削除をDB関数で防ぎ、削除後のセット番号を種目単位で再採番した。
- 日付・セッションID・セットID・重量・レップ数のZod検証を追加した。
- ダッシュボードから記録一覧への導線を追加した。

## 発生した問題と対応

- セッション編集時にセットを個別更新すると途中失敗で不整合が残るため、DB関数内でセッション更新、既存セット削除、再登録を原子的に実行した。
- 最終セットを削除すると空セッションが残るため、セッション行をロックしてセット数を確認し、最終セットの場合は安全なエラーを返す設計にした。
- セット削除で番号が欠番になるため、削除トランザクション内で種目単位に連番を再採番した。
- production buildが`next-env.d.ts`を更新したため、目的外の生成差分を除外した。
- ローカル環境にSupabase CLIがないため、migrationは静的契約テストで検証した。適用時はSupabase側でも動作確認する。

## 主なコミット

- `5c11160 feat(log): add workout history management (#3)`

## 検証結果

- Red確認: データ契約4 suites、UI 4 suitesで失敗を確認
- `bun run type-check`: 成功
- `bun run lint`: 成功（ESLint warning 0）
- `bun run test:run`: 成功（25 files / 97 tests）
- `bun run test:coverage`: 成功（actions 90.83%、WorkoutForm 98.46%、WorkoutSessionCard 94.73%、validation・集約100%）
- `bun run build`: 成功
- OSV Scanner `2.4.0`: 成功（794 packages / No issues found）
- サブエージェントによるコミット前確認: 成功（型 / Lint warnings 0 / 25 files・97 tests）
- GitHub Actions: 成功（Quality: install / type-check / lint / test / build）

## 注意事項

- migration適用後に`lib/supabase/database.types.ts`をSupabase CLIで再生成し、手動定義との差分を確認する。
- 最終セットを削除する場合は、先に別セットを追加するかセッション全体を削除する。
- カレンダービューはISSUE-009で実装する。
