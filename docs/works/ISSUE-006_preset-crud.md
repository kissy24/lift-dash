# [ISSUE-006] プリセットCRUD 作業記録

## 対象

- GitHub Issue: #27 `[ISSUE-006] プリセットCRUD`
- PR: 作成後に記録
- ブランチ: `feat/ISSUE-006_preset-crud`

## 実施日

- 2026-07-05

## 実施内容

- Phase 2のISSUE-006〜009を要件から分割し、ローカルIssueファイルとGitHub Issueを登録した。
- `presets`、`preset_items`、制約、インデックス、AAL2必須RLSを追加した。
- プリセットと全アイテムを原子的に作成・更新するsecurity invoker DB関数を追加した。
- 名称、種目、任意の重量・レップ数、セット数、重複種目を検証するZodスキーマを追加した。
- AAL2認証後に作成・更新・削除するServer Actionsを追加した。
- React Hook Formで種目追加・削除・並べ替えができるプリセットフォームを追加した。
- 一覧、新規作成、編集、cascade削除とダッシュボード導線を追加した。

## 発生した問題と対応

- 任意数値の空欄がフォーム変換時に`0`になるケースを検出し、空文字・null・undefined・NaNを`null`として扱うよう修正した。
- 作成・更新途中の失敗でプリセットとアイテムが不整合にならないよう、DB関数内の単一トランザクションで保存した。
- production buildが`next-env.d.ts`を更新したため、目的外の生成差分を除外した。
- ローカル環境にSupabase CLIがないため、migrationは静的契約テストで検証した。適用時はSupabase側でも動作確認する。

## 主なコミット

- コミット後に記録

## 検証結果

- Red確認: DB・validation・action 3 suites、UI 5 suitesで失敗を確認
- `bun run type-check`: 成功
- `bun run lint`: 成功（ESLint warning 0）
- `bun run test:run`: 成功（33 files / 119 tests）
- `bun run test:coverage`: 成功（preset action 81.17%、PresetForm 98.27%、PresetList 87.5%、preset validation 100%）
- `bun run build`: 成功
- OSV Scanner `2.4.0`: 成功（794 packages / No issues found）
- サブエージェントによるコミット前確認: 成功（型 / Lint warnings 0 / 33 files・119 tests）
- GitHub Actions: PR作成後に確認

## 注意事項

- migration適用後に`lib/supabase/database.types.ts`をSupabase CLIで再生成し、手動定義との差分を確認する。
- 種目削除時は外部キーのcascadeにより該当する`preset_items`も削除される。
- ISSUE-007ではプリセット値を記録フォームの初期値へ変換し、保存済みプリセットとは独立した値として扱う。
