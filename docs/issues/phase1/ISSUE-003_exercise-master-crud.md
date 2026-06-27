# [ISSUE-003] 種目マスタCRUD

## 概要

種目マスタの一覧、登録、編集、削除を実装する。

## 背景・目的

トレーニング記録やプリセットで参照する基礎データとして、ユーザーが管理できる種目マスタが必要である。

## 受け入れ条件 (Acceptance Criteria)

- [x] `/exercises` で種目一覧を表示できる
- [x] 種目名と筋肉部位を指定して登録できる
- [x] 既存種目を編集できる
- [x] 既存種目を削除できる
- [x] Server Actions で認証チェックと Zod バリデーションを行っている
- [x] Supabase の RLS 前提で通常の anon key クライアントを使用している
- [x] 対応するテストがすべてグリーン

## 技術詳細

- `muscle_group` は `chest` / `back` / `legs` / `shoulders` / `arms` / `core` / `cardio` / `other` に限定する
- Server Action の戻り値は `{ success: true }` または `{ success: false, error: ... }` に統一する
- UI コンポーネントは shadcn/ui をベースに実装する

## 関連ファイル（予定）

- `app/exercises/page.tsx`
- `components/forms/ExerciseForm.tsx`
- `lib/actions/exercise.ts`
- `lib/validations/exercise.ts`
- `lib/supabase/database.types.ts`

## 依存 Issue

- ISSUE-001（先に完了が必要）
- ISSUE-002（先に完了が必要）

## 見積もり

- [ ] Small（〜2h）
- [x] Medium（〜1日）
- [ ] Large（〜3日）
