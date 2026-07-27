# [ISSUE-017] Security Audit脆弱性対応 作業記録

## 対象

- GitHub Issue: #48 `[ISSUE-017] Security Audit脆弱性対応`
- PR: 作成予定
- ブランチ: `fix/ISSUE-017_security-audit-remediation`

## 実施日

- 2026-07-27

## 実施内容

- 失敗したSecurity Audit run `30265879859`のログを確認し、8パッケージ・19件の既知脆弱性を特定した。
- `next`と`eslint-config-next`を`15.5.19`から`15.5.21`へ更新した。
- `postcss`を`8.5.15`から`8.5.18`へ更新した。
- `brace-expansion`、`fast-uri`、`js-yaml`、`sharp`を修正版へ固定し、`bun.lock`を再生成した。
- OSV Scannerで更新後の`bun.lock`に既知脆弱性がないことを確認した。
- Bun `1.2.0`でfrozen installを行い、CIと同じパッケージマネージャーバージョンでlockfile互換性を確認した。

## 発生した問題と対応

- `brace-expansion`の新しい脆弱性は旧1.x/2.x系列に修正版がなく、Bunもnested overridesを未対応だったため、全系列を`5.0.8`へ固定した。
- `brace-expansion 5.x`はCommonJSのexport形状が旧版と異なり、`minimatch 3.x/9.x`との互換性チェックが失敗した。
- 公式`5.0.8`の脆弱性修正ロジックは変更せず、callable CommonJS exportとESM default exportだけを復元するBun patchを追加した。
- `minimatch 3.x/9.x/10.x`の各読み込み経路を確認する回帰テストを追加した。
- コミット時に`commitlint`がESM形式の設定を読み込めず空のルールとして扱ったため、設定ファイルをCommonJS形式の`commitlint.config.cjs`へ変更した。
- `next build`が生成した目的外の`next-env.d.ts`差分はコミット対象から除外した。

## セキュリティ修正版の確認

- `next 15.5.21`: 2026-07-21公開。7日未満だが既知脆弱性修正の例外として公開tarball差分とintegrityを確認した。
- `brace-expansion 5.0.8`: 2026-07-23公開。7日未満だが既知脆弱性修正の例外として公開tarball差分、git commit、integrityを確認した。
- `postcss 8.5.18`: 2026-07-12公開。
- `sharp 0.35.0`: 2026-06-10公開。
- `fast-uri 3.1.4`: 2026-07-19公開。
- `js-yaml 4.3.0`: 2026-06-26公開。

## 主なコミット

- 作成予定

## 検証結果

- `bunx bun@1.2.0 install --frozen-lockfile --ignore-scripts`: 成功
- OSV Scanner `2.4.0`: 成功（790 packages / No issues found）
- 依存互換性テスト: 成功（1 file / 3 tests）
- `bun run type-check`: 成功
- `bun run lint`: 成功（ESLint warning 0）
- `bun run test:run`: 成功（46 files / 170 tests）
- `bun run build`: 成功
- サブエージェントによるコミット前確認: 成功
- `commitlint`設定読み込み・コミットメッセージ検証: 成功
- GitHub Actions: 確認予定

## 注意事項

- `brace-expansion`の旧系列に公式バックポートが公開された場合は、overrideと互換パッチを削除できるか再評価する。
- Bunは現時点でtop-level overridesのみ対応しており、同一パッケージの複数major系列を個別固定できない。
- `sharp 0.35.0`はNext.js `15.5.21`の宣言範囲外をoverrideしているため、Next.js側の対応版が公開されたらoverrideを削除する。
