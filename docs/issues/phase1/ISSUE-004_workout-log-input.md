# [ISSUE-004] 手動トレーニング記録入力

## 概要

手動で種目を追加し、セッション日付、メモ、セットごとの重量・レップ数を入力して保存できる画面を実装する。

## 背景・目的

MVP の中核機能として、プリセットなしでも日々のトレーニング実績を記録できる必要がある。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `/log/new` でトレーニング日付を指定できる
- [ ] 種目を手動追加できる
- [ ] セットごとに重量とレップ数を入力できる
- [ ] ＋/－ ボタンでセット数を追加・削除できる
- [ ] 保存後に `/log/[date]` に遷移する
- [ ] Server Actions で認証チェックと Zod バリデーションを行っている
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- `workout_sessions` と `workout_sets` に保存する
- 書き込みは必ず Server Actions 経由にする
- フォームは React Hook Form + Zod を使う
- 日付のデフォルトは今日にする

## 関連ファイル（予定）

- `app/log/new/page.tsx`
- `components/forms/WorkoutForm.tsx`
- `lib/actions/workout.ts`
- `lib/validations/workout.ts`
- `lib/utils/metrics.ts`

## 依存 Issue

- ISSUE-001（先に完了が必要）
- ISSUE-002（先に完了が必要）
- ISSUE-003（先に完了が必要）

## 見積もり

- [ ] Small（〜2h）
- [ ] Medium（〜1日）
- [x] Large（〜3日）
