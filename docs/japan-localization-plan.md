# Tilegrams 日本語ユーザー向け改修 実装計画

作成日: 2026-07-03

## 現状整理（実装済みの資産）

- **日本地図**: `maps/japan/japan.topo.json`（47都道府県）+ `fitExtent` ベースの投影が `GeographyResource.js` に登録済み
- **日本データセット**: 「Japan Prefectures 1-to-1」「Japan Population」（`data/japan/prefectures.csv` / `population.csv`）
- **プリセットタイルグラム**: `tilegrams/japan-prefectures-one-to-one.json`
- **都道府県名辞書**: `data/japan/japan-names.json`（`name` のみ、`name_short` なし）
- **東京23区の素材**: `maps/japan/tokyo.topo.json` / `data/japan/tokyo-names.json` / `tokyo-wards.csv` は存在するが **コメントアウトで未接続**
- **UI日本語化**: ステップ見出し・イントロ文・トースト・MANUAL.md は日本語化済み。ただし一部コンポーネントに英語が残存
- **データ道具箱統合**: ヘッダー（プロジェクト保存/読込、TopoJSON/SVG/PNG エクスポート）は統合済み

---

## フェーズ1: 日本語化の完成（小規模・即効性高）

### 1-1. 残存英語文字列の日本語化
| ファイル | 対象 |
|---|---|
| `source/components/DatasetSelector.js:4` | `'Custom CSV'` → 「カスタムCSV（アップロード）」 |
| `source/components/ImportControls.js:9` | `'Upload custom tilegram'` → 「タイルグラムをアップロード」 |
| `source/components/ImportControls.js:134` | `Using {filename}` → 「{filename} を使用中」 |
| `source/components/HexMetrics.js:177` | `'No Data'` → 「データなし」 |
| `source/components/EditWarningModal.js` | 警告文・`Yes`・`Resume Editing` → 日本語 |
| `source/Ui.js:411` | Tooltip の英語文 → 「統計的に正確にするには、一部の地域で手動調整が必要です」 |
| `source/resources/DatasetResource.js:_warnDataErrors` | カスタムCSVの検証エラー文 → 日本語 |
| `source/components/MobileRedirect.js` | モバイル向け案内文の日本語確認 |

### 1-2. 選択肢ラベルの日本語化と並び替え
- `GeographyResource` の `label` は**内部キーとしても使われている**ため、`id`（内部キー、既存の英語値を維持）と `displayLabel`（表示用日本語）を分離する。保存済みプロジェクト・エクスポート済みファイルとの後方互換を壊さないことが必須条件
- 表示例: 「日本（都道府県）」「アメリカ合衆国（州）」「フランス（地域圏）」など
- データセット/タイルグラムのラベルも日本語化（「日本の人口（2020年国勢調査）」「都道府県 1対1」など）
- **日本を先頭に配置し、初期選択を日本にする**（現状は U.S. GDP が初期値: `DatasetResource._selectedDatasetIndex = 2`、初期 geography も United States）

### 1-3. タイル上ラベルの日本語表示（実質バグ修正）
- `GridGraphic.js:468` と `HexMetrics.js:179` は `name_short || id` を参照するため、日本は**コード番号（1〜47）がそのまま表示されている**
- `data/japan/japan-names.json` に `name_short` を追加（「北海道」「青森」「神奈川」…都府県サフィックスを除いた短縮名）
- Canvas フォント `Fira Sans`（`GridGraphic.js:466,549`）を日本語対応スタックに変更:
  `'Fira Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', sans-serif`

---

## フェーズ2: 日本向け地図・データ拡充

### 2-1. 東京23区モードの有効化
- 素材は揃っているため、配線のみ:
  - `GeographyResource.js` に「東京23区」geography を追加（`tokyo.topo.json` の objects 名を確認し、`fitExtent` 投影で登録）
  - `DatasetResource.js` のコメントアウト解除 + 23区人口データセット追加
  - 23区 1対1 のプリセットタイルグラムを本ツールで生成して `tilegrams/` に同梱
- 市区町村コード（131016 など）の名前辞書は `tokyo-names.json` にあり。`name_short`（「千代田」「中央」…）も追加

### 2-2. データセット拡充（e-Stat 等の公的統計から）
- 衆議院小選挙区数（289、各都道府県の定数）— 選挙報道向けの定番用途
- 世帯数 / 高齢者人口 / 県内総生産 など、需要の高い指標を2〜3件
- 各CSVの出典・年次を `docs/data-sources.md` に記録し、UIのラベルにも年次を明記

### 2-3. プリセットタイルグラム拡充
- 「日本 人口比タイルグラム」（人口50万人/タイル程度）を作成・同梱
- 衆議院小選挙区タイルグラム（2-2 とセット）

---

## フェーズ3: CSV入出力の日本語環境対応

### 3-1. カスタムCSVのID解決を柔軟に
- 現状 `parseCsv` は日本の場合 `parseInt` のみ（`DatasetResource.js:149-150`）
- 受け付ける形式を拡張: `1` / `01` / `JP-01`（ISO 3166-2）/ 「北海道」「東京都」「東京」（都道府県名・短縮名）
- 名前→コードの逆引きテーブルを `japan-names.json` から生成

### 3-2. 文字コード・書式対応
- e-Stat 等のCSVは **Shift_JIS が多い** → `FileReader.readAsText` の前にバイト判定し、`TextDecoder('shift_jis')` でフォールバック
- UTF-8 BOM の除去、ヘッダー行（数値でない1行目）の自動スキップ、値のカンマ（`1,234,567`）・全角数字の許容

### 3-3. テンプレートと導線
- 「CSVテンプレートをダウンロード」リンクを DatasetSelector のカスタム選択時に表示（都道府県コード+名前入りのサンプルCSV）
- MANUAL.md に e-Stat からのデータ取得〜整形手順を追記

### 3-4. エクスポート改善
- ファイル名を地域・内容入りに: `japan-tilegram.topo.json` / `tilegram.svg` → `japan-tilegram.svg` など（`ExportController.js`）
- SVG エクスポートに**日本語ラベルテキストを埋め込むオプション**（現状は group id のみ。`Exporter.toSvg` に `<text>` 要素追加）。Illustrator 等での後加工需要が高い

---

## フェーズ4: UI/UX 改善

- **マニュアル整合**: MANUAL.md 内の「Load existing」「Export」「Refine your tilegram」等の英語UI参照を、現在の日本語UI名称（「1. 開く・作成する」等）に合わせて更新
- **dat-gui 設定パネル**（`constants.js`）: `tileScale` / `displayMap` / `displayGrid` の日本語ラベル化、または簡易な独自チェックボックスUIへの置換
- **TilegramNotice**: 日本プリセット選択時に出典（国勢調査年次等）を表示
- **数値表記**: `comma-number` 済みだが、「〜タイルあたり」等の単位表現を確認し「1タイル = 50万人」のような分かりやすい表現へ
- **初回体験**: 初期表示を「日本 都道府県 1対1」タイルグラムにし、日本語ユーザーが開いた瞬間に自分事化できるようにする

---

## フェーズ5（任意・別トラック）: 基盤整備

- **文字列の一元管理**: `source/i18n/ja.js` に集約（data-portal の `src/i18n/sections` の構成に倣う）。フェーズ1をこの構造で実装すると後工程が楽
- **ツールチェーン近代化**: webpack 1 / React 15 / node-sass（Node 16 + Python 2.7 依存）→ Vite + React 18 への移行。効果は大きいが影響範囲も大きいため、機能改修とは分離した専用ブランチで実施
- `tests/run.js` の既存テストを各フェーズ後に実行して回帰確認

---

## 実施順序と規模感

| フェーズ | 規模 | 依存関係 |
|---|---|---|
| 1. 日本語化完成 | 小（1〜2セッション） | なし。最優先 |
| 2. 地図・データ拡充 | 中 | 1-2 のID/ラベル分離後が望ましい |
| 3. CSV入出力対応 | 中 | 単独で可 |
| 4. UI/UX改善 | 小 | 1 の後 |
| 5. 基盤整備 | 大 | 任意・別トラック |

各フェーズ完了ごとに `npm run build` → `dist/` を `-f` 付きコミット → push で Netlify にデプロイ（README の手順どおり）。
