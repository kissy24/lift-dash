# Security Audit復旧 (GitHub Issue #75)

- 日付: 2026-11-03
- ブランチ: fix/security-audit-november
- 原因: run 40354170536で14パッケージ50件の既知脆弱性が検出された。
- 変更: Next.js 15.5.28、Zod 4.6.7、Vite 8.1.6、Vitest 4.1.12へ更新。間接依存を互換範囲で再解決し、既存overrideを修正版へ更新した。
- minimatch 11.0.4を固定し、旧利用元が期待するcallable CommonJS exportを維持するパッチを追加。brace-expansionの既存パッチも5.0.12に更新し、新規の深さ・書換回数制限定数を保持した。
- 公開日: minimatch以外の直接更新・overrideは公式npm公開から7日以上経過。minimatch 11.0.4 (2026-11-02公開)はGHSA-g3hv-75wg-m249修正のためセキュリティ例外を適用。
- 検証: Bun監査0件、Bun 1.2.0 frozen install成功、本番ビルド成功。型・Lint・全テストはコミット前に別エージェントで再検証する。
- CI: Push後にQualityとOSV Scannerの結果を確認する。
