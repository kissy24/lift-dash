# [ISSUE-013] Dependabotマージ後の依存関係修復

## 概要

Dependabot PRのマージで不整合になった`package.json`と`bun.lock`を同期し、要求仕様と互換性のないTailwind CSS v4更新をv3へ戻す。今後同種の破損をマージ前に検出する品質CIを追加する。

## 背景・目的

PR #7〜#11のマージ後、`bun install --frozen-lockfile`がlockfile変更要求で失敗している。またTailwind CSSはv4へ更新された一方、PostCSS pluginやCSS入口はv3構成のままであり、要求仕様のTailwind CSS v3とも一致しない。Issue 004へ進む前にmainを再現可能で検証済みの状態へ戻す必要がある。

## 受け入れ条件 (Acceptance Criteria)

- [x] `package.json`と`bun.lock`が同期し、`bun install --frozen-lockfile`が成功する
- [x] Tailwind CSSが要求仕様どおりv3.4系へ戻り、既存PostCSS・theme設定でbuildできる
- [x] クールタイムを満たす互換更新は、テストで問題がなければ維持される
- [x] DependabotがTailwind CSSのmajor updateを自動提案しない
- [x] PRでfrozen install、型チェック、Lint、全テスト、buildを実行する品質CIが追加される
- [x] OSV Scannerで`bun.lock`の脆弱性が検出されない
- [x] 対応するテストがすべてグリーン

## 技術詳細

- `tailwindcss`を要求仕様に合う`3.4.18`へ戻す
- Zod、React Hook Form、React Testing Library、jsdomの更新は7日クールタイムを確認し、品質チェックが通る場合のみ維持する
- Bunでlockfileを再生成し、frozen installで再現性を確認する
- `.github/dependabot.yml`で`tailwindcss`のsemver-major更新を除外する
- GitHub ActionsへBun setupと品質チェックworkflowを追加する

## 関連ファイル（予定）

- `package.json`
- `bun.lock`
- `.github/dependabot.yml`
- `.github/workflows/quality.yml`
- `docs/works/ISSUE-013_dependabot-merge-recovery.md`

## 依存 Issue

- ISSUE-003（完了済み）

## 見積もり

- [ ] Small（〜2h）
- [x] Medium（〜1日）
- [ ] Large（〜3日）
