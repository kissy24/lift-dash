# [ISSUE-003] 種目マスタCRUD 作業記録

## 対象

- GitHub Issue: #2 `[ISSUE-003] 種目マスタCRUD`
- PR: 作成後に記録
- ブランチ: `feat/ISSUE-003_exercise-master-crud`

## 実施日

- 2026-06-27

## 実施内容

- `exercises` テーブル、更新日時trigger、権限、RLS policyのmigrationを追加した。
- authenticated roleの通常CRUD policyに加え、JWTの`aal2`を要求するrestrictive policyを追加した。
- migrationに対応するSupabase Database型と、型付きブラウザ／サーバー／Middlewareクライアントを追加した。
- 種目名、筋肉部位、UUIDを検証するZodスキーマを追加した。
- 認証とAAL2を最初に確認する登録・編集・削除Server Actionsを追加した。
- `/exercises`をServer Componentとして実装し、種目一覧をサーバーで取得するようにした。
- 種目の登録、インライン編集、削除確認、エラー表示を実装した。
- ダッシュボードから種目マスタへの導線を追加した。
- Validation、Server Actions、migration、フォーム、一覧、ページのテストを追加した。

## 発生した問題と対応

- Supabase CLI、Docker、`.env.local`がないため、migrationのローカルDB適用と実SupabaseへのE2E確認は実施できなかった。
- 新しい依存関係は追加せず、migration SQLを静的テストし、型定義はmigrationと一致する形で作成した。Supabase環境接続後にCLI生成結果との差分確認が必要。
- MFAをアプリのMiddlewareだけに依存させず、RLSとServer ActionsでもAAL2を強制して直接アクセス経路を保護した。
- `next build`により`next-env.d.ts`へ目的外の生成差分が発生したため、コミット対象から除外した。

## 主なコミット

- コミット後に記録

## 検証結果

- `bun run type-check`: 成功
- `bun run lint`: 成功（ESLint warning 0）
- `bun run test:run`: 成功（14 files / 53 tests）
- `bun run test:coverage`: 成功（`lib/actions` 90.5%、新規CRUD UI 100%）
- `bun run build`: 成功
- サブエージェントによるコミット前確認: 成功
- GitHub Actions: PR作成後に確認

## 注意事項

- migration適用後、`supabase gen types typescript`で型を再生成し、`lib/supabase/database.types.ts`との差分を確認する。
- RLSの`mfa_required` policyは`as restrictive`を維持し、今後追加するテーブルにも同じAAL2制約を適用する。
- `exercises`を参照するテーブルを追加した後は、削除時の外部キー制約エラーをユーザー向けに区別することを検討する。
