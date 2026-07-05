# [ISSUE-006] プリセットCRUD

## 概要

トレーニング種目とデフォルト値をまとめたプリセットを登録・表示・編集・削除できる管理画面を実装する。

## 背景・目的

繰り返し行うトレーニング構成を保存し、ISSUE-007の一括入力で再利用できる基礎データを整備する。

## 受け入れ条件 (Acceptance Criteria)

- [x] `/presets`でプリセット一覧を表示できる
- [x] `/presets/new`で名称と1件以上の種目を登録できる
- [x] 各種目にデフォルト重量・レップ数・セット数を設定できる
- [x] `/presets/[id]`で名称、種目、デフォルト値、表示順を編集できる
- [x] プリセットを削除すると関連する`preset_items`も削除される
- [x] Server ActionsでAAL2認証チェックとZodバリデーションを行っている
- [x] RLSでanonを拒否し、authenticatedかつAAL2だけが操作できる
- [x] 対応するテストがすべてグリーン

## 技術詳細

- `presets`と`preset_items`を追加し、外部キーは`on delete cascade`にする
- プリセットとアイテムの作成・更新はDB関数で原子的に処理する
- 同一プリセット内の同一種目は1件までとする
- `order_index`は0始まりの連番として保存する
- フォームはReact Hook Form + Zodを使う

## 関連ファイル（予定）

- `app/presets/page.tsx`
- `app/presets/new/page.tsx`
- `app/presets/[id]/page.tsx`
- `components/forms/PresetForm.tsx`
- `lib/actions/preset.ts`
- `lib/validations/preset.ts`
- `supabase/migrations/*_create_presets.sql`

## 依存 Issue

- ISSUE-002（先に完了が必要）
- ISSUE-003（先に完了が必要）

## 見積もり

- [ ] Small（〜2h）
- [ ] Medium（〜1日）
- [x] Large（〜3日）
