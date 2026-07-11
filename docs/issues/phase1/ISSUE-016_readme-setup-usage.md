# [ISSUE-016] READMEセットアップ・利用ガイド

## 概要

READMEにLiftDashの概要、ローカルセットアップ、Supabase設定、基本的な使い方、品質確認コマンドをまとめる。

## 背景・目的

現在のREADMEはプロダクト名と短い説明だけで、環境構築や初回ログイン、各機能の操作方法を確認できない。新しい環境で安全にアプリを起動し、主要機能を迷わず利用できるドキュメントを整備する。

## 受け入れ条件 (Acceptance Criteria)

- [ ] LiftDashの目的と主要機能を確認できる
- [ ] 必要なランタイム・外部サービスを確認できる
- [ ] Supabaseプロジェクト、migration、認証、TOTP MFAの設定方法を確認できる
- [ ] `.env.local`の作成から開発サーバー起動まで実行可能な手順を確認できる
- [ ] 初回ログインとMFA登録の流れを確認できる
- [ ] 種目、プリセット、トレーニング記録、履歴、ダッシュボードの使い方を確認できる
- [ ] 型チェック、Lint、テスト、ビルド、セキュリティ監査のコマンドを確認できる
- [ ] シークレット管理とAAL2/RLSの注意事項を確認できる
- [ ] READMEの記載内容が現在のコード・設定と一致する
- [ ] 対応する検証がすべてグリーン

## 技術詳細

- 実際の`package.json`、`.env.example`、Supabase migration、画面ルートを情報源とする
- コマンドはBunベースで統一する
- Supabase CLIによるremote projectへのmigration適用手順を記載する
- アプリにサインアップ画面がないため、初期ユーザーはSupabase Dashboardで作成する手順を記載する
- `SUPABASE_SERVICE_ROLE_KEY`は不要であり、公開環境変数だけを利用することを明記する

## 関連ファイル（予定）

- `README.md`
- `docs/works/ISSUE-016_readme-setup-usage.md`

## 依存 Issue

- ISSUE-001〜ISSUE-012（主要機能が完了済みであること）

## 見積もり

- [x] Small（〜2h）
- [ ] Medium（〜1日）
- [ ] Large（〜3日）
