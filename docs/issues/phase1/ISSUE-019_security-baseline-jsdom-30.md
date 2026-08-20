# [ISSUE-019] セキュリティ基準線回復とjsdom 30移行

## 概要

現在の`main`で検出される既知脆弱性と日時依存テストを解消し、`jsdom 30.0.1`への移行を含む安全な依存構成へ更新する。

## 背景・目的

Dependabot PR #55は公開後7日を経過しているが、`jsdom 30.0.1`のNode.js要件とプロジェクトのREADMEが一致せず、最新`main`とも競合している。また、2026-08-17時点のOSV Scannerは6パッケージ11件の既知脆弱性を検出し、Qualityは実行月に依存するテストで失敗している。親依存の更新を優先して`undici`を解消し、残りの脆弱依存も最小範囲で更新して、後続の依存更新を安全に検証できる基準線を回復する。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `jsdom`が`30.0.1`へ更新され、`undici 7.28.0`が`bun.lock`から除去されている
- [ ] Node.js要件が`jsdom 30.0.1`のengine条件と一致し、READMEと`package.json`に明記されている
- [ ] `brace-expansion`、`fast-uri`、`js-yaml`、`nanoid`、`postcss`、`undici`の検出済み脆弱バージョンが`bun.lock`から除去されている
- [ ] `app/log/page.test.tsx`が実行月に依存せず安定して成功する
- [ ] `bun install --frozen-lockfile`でlockfile差分が発生しない
- [ ] `bun run type-check`、`bun run lint`、`bun run test:run`、`bun run test:coverage`、`bun run build`が成功する
- [ ] OSV Scannerで既知脆弱性が検出されない
- [ ] GitHub ActionsのQualityとSecurity Auditが成功する
- [ ] Dependabot PR #55に後継PRを案内してクローズする
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- TDDで日時依存テストの再現条件を固定してから実装修正する
- transitive dependencyは親パッケージ更新を優先し、必要な場合のみ`overrides`を最小範囲で更新する
- `jsdom 30.0.1`が要求するNode.js範囲`^22.22.2 || ^24.15.0 || >=26.0.0`を開発要件へ反映する
- `brace-expansion`の更新時は既存のBun互換パッチが引き続き必要か実動確認し、不要なら安全に撤去する
- 対象修正版は2026-08-17時点ですべて公開後7日以上経過済みである

## 関連ファイル（予定）

- `package.json`
- `bun.lock`
- `README.md`
- `app/log/page.test.tsx`
- `lib/dependencies/`
- `patches/`
- `docs/works/ISSUE-019_security-baseline-jsdom-30.md`

## 依存 Issue

- ISSUE-018（完了済み）

## 見積もり

- [ ] Small（〜2h）
- [x] Medium（〜1日）
- [ ] Large（〜3日）
