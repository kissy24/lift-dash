# [ISSUE-002] 認証とMFA 作業記録

## 対象

- GitHub Issue: #5 `[ISSUE-002] 認証とMFA`
- PR: 作成後に記録
- ブランチ: `feat/ISSUE-002_authentication`

## 実施日

- 2026-06-27

## 実施内容

- Supabase SSR のブラウザ用・サーバー用・Middleware 用クライアントを追加した。
- メールアドレスとパスワードによるログイン Server Action とフォームを追加した。
- TOTP の登録、QRコードと設定キーの表示、初回コード検証を実装した。
- 登録済み TOTP を使ったログイン時の MFA チャレンジを実装した。
- 未検証の TOTP factor が残っている場合、再登録前に削除して登録を再開できるようにした。
- 未認証、MFA未登録、MFA未検証、AAL2 の4状態で遷移先を制御した。
- Middleware で保護ルートへの未認証アクセスと AAL2 未達セッションを遮断した。
- ログアウト Server Action と各認証済み画面のログアウト導線を追加した。
- 認証入力の Zod スキーマ、Server Actions、遷移判定、フォームのテストを追加した。
- Supabase 接続に必要な公開環境変数の `.env.example` を追加した。

## 発生した問題と対応

- Node.js がインストールされておらず、Bun 上で Vitest worker が `port.addListener is not a function` により停止した。
- Homebrew で Node.js 22 を導入して通常の PATH に link し、Vitest を Node.js ランタイムで実行できる状態にした。
- `next build` により `next-env.d.ts` に目的外の生成差分が発生したため、コミット対象から除外した。
- 独立レビューで、検証済みTOTPを持つAAL1セッションが登録Actionを直接呼べる境界条件を検出した。検証済みfactorが存在する場合は新規登録を拒否し、MFA差し替えを防ぐ回帰テストを追加した。
- `.env.local` が未設定のため、実 Supabase プロジェクトに対するログインと TOTP の E2E 確認は未実施。モックを使った Server Action／UI テストと production build で検証した。
- `next build` では `@supabase/ssr@0.8.0` の Edge Runtime 互換警告と、親ディレクトリの別 lockfile による workspace root 推定警告が出るが、ビルドは成功した。

## 主なコミット

- コミット後に記録

## 検証結果

- `bun run type-check`: 成功
- `bun run lint`: 成功（ESLint warning 0）
- `bun run test:run`: 成功（8 files / 28 tests）
- `bun run test:coverage`: 成功（`lib/actions` 87.8%、認証フォーム群 89.3%）
- `bun run build`: 成功
- サブエージェントによるコミット前確認: 成功
- GitHub Actions: PR 作成後に確認

## 注意事項

- ローカル動作確認には `.env.example` を元に `.env.local` を作成し、Supabase URL と anon key を設定する必要がある。
- Supabase Dashboard で Email/Password と TOTP MFA の Enrollment、Challenge、Verification API を有効にする必要がある。
- ISSUE-003 で DB と RLS を作成するときは、アプリのルート保護だけでなく JWT の `aal2` を restrictive policy で強制する。
- `@supabase/ssr` 更新時は、7日間クールタイムを確認し、Middleware の Cookie API 変更と Edge Runtime 警告を再評価する。
