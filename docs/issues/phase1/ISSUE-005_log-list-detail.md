# [ISSUE-005] 記録一覧・詳細表示

## 概要

トレーニング記録の一覧と、特定日の記録詳細・編集・削除を実装する。

## 背景・目的

入力したトレーニング記録を振り返り、誤入力を修正または削除できる MVP の確認・管理機能が必要である。

## 受け入れ条件 (Acceptance Criteria)

- [x] `/log` で記録のある日を一覧表示できる
- [x] `/log/[date]` で特定日のセッションとセット詳細を表示できる
- [x] セッション単位で記録を編集できる
- [x] セッション単位で記録を削除できる
- [x] セット単位で記録を編集・削除できる
- [x] Server Actions で認証チェックと Zod バリデーションを行っている
- [x] 対応するテストがすべてグリーン

## 技術詳細

- Phase 1 ではカレンダービューではなく一覧表示を優先し、カレンダービューは ISSUE-009 で実装する
- 日付ルートは `YYYY-MM-DD` を受け付け、Zod または date-fns で検証する
- 削除時は `workout_sessions` の cascade delete で関連セットを削除する
- セッション全体の編集はDB関数で原子的に更新する
- 最終セットの単独削除は禁止し、セッション単位の削除を案内する

## 関連ファイル（予定）

- `app/log/page.tsx`
- `app/log/[date]/page.tsx`
- `components/forms/WorkoutForm.tsx`
- `lib/actions/workout.ts`
- `lib/validations/workout.ts`
- `supabase/migrations/20260705160000_manage_workouts.sql`

## 依存 Issue

- ISSUE-001（先に完了が必要）
- ISSUE-002（先に完了が必要）
- ISSUE-003（先に完了が必要）
- ISSUE-004（先に完了が必要）

## 見積もり

- [ ] Small（〜2h）
- [ ] Medium（〜1日）
- [x] Large（〜3日）
