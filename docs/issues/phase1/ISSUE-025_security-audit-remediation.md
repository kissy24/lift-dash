# [ISSUE-025] Security Auditの既知脆弱性修正

2026-10-26のSecurity Audit (40354170536) は14パッケージ50件の既知脆弱性で失敗した。

直接依存を互換性のあるセキュリティ修正版へ更新し、間接依存を再解決する。親の更新で残るもののみ最小範囲のoverrideを適用する。

受け入れ条件:

- frozen installが成功する
- 型・Lint・全テスト・ビルドが成功する
- OSV監査とGitHub ActionsのQuality / Security Auditが成功する

ユーザーは2026-11-03に上記修正計画を承認済み。
