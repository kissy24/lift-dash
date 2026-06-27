# [ISSUE-002] 認証とMFA

## 概要

Supabase Auth を使ったメール・パスワードログイン、ログアウト、MFA(TOTP) 入力、未認証リダイレクトを実装する。

## 背景・目的

LiftDash は個人のトレーニング記録を扱うため、全画面を認証配下に置き、MFA を必須化して安全に利用できる状態にする。

## 受け入れ条件 (Acceptance Criteria)

- [x] `/login` でメール・パスワードログインができる
- [x] MFA(TOTP) の登録または検証フローが実装されている
- [x] ログアウトできる
- [x] 未認証ユーザーは保護ページから `/login` にリダイレクトされる
- [x] 認証済みユーザーは `/` から `/dashboard` に遷移する
- [x] Supabase のブラウザ用・サーバー用クライアントが分離されている
- [x] 対応するテストがすべてグリーン

## 技術詳細

- `@supabase/ssr` を使って Client Component 用と Server Component/Action 用のクライアントを分ける
- Middleware または Server Component のリダイレクトで未認証アクセスを制御する
- `SUPABASE_SERVICE_ROLE_KEY` は使用しない
- フォーム入力は Zod で検証する

## 関連ファイル（予定）

- `app/page.tsx`
- `app/login/page.tsx`
- `middleware.ts`
- `components/forms/LoginForm.tsx`
- `lib/actions/auth.ts`
- `lib/validations/auth.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`

## 依存 Issue

- ISSUE-001（先に完了が必要）

## 見積もり

- [ ] Small（〜2h）
- [ ] Medium（〜1日）
- [x] Large（〜3日）
