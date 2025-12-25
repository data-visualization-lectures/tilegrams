# サムネイル画像API対応 実装計画

## 概要
現在、`source/utils/CloudApi.js` 内で実装されているプロジェクト保存・読み込み処理は、クライアントサイドで直接 Supabase SDK (`window.supabase`) を使用して DB 操作および Storage 操作を行っています。
これを `_documents/API_SPECIFICATION.md` の仕様に従い、サーバサイドAPI (`https://api.dataviz.jp/api/projects`) を経由する実装に修正します。
特に、サムネイル画像については、現在 Storage に直接アップロードしていますが、API の `thumbnail` フィールド (Base64) を利用する形に変更し、取得時も API 経由で行います。

## 修正対象ファイル
*   `source/utils/CloudApi.js`

## 変更詳細

### 1. `saveProject` メソッドの修正
**現状:**
*   クライアントで UUID を生成。
*   Supabase Storage に JSON と 画像 (PNG) を直接アップロード。
*   Supabase DB (`projects` テーブル) にレコードを `insert`。

**修正後:**
*   `POST /api/projects` エンドポイントを使用します。
*   以下のような JSON リクエストボディを構築し送信します。
*   `_dataURLToBlob` での Blob 変換は不要になり、`thumbnail` 引数 (Base64 文字列) をそのまま送信します。
    ```json
    {
      "name": "プロジェクト名",
      "app_name": "tilegrams",
      "data": { ... }, // プロジェクトデータ(JSONオブジェクト)
      "thumbnail": "data:image/png;base64,..." // Base64形式の画像データ
    }
    ```
*   UUID生成、Storageへのアップロード、DB保存はAPI側で行われるため、クライアント側の関連ロジック（`_generateUUID` 等）および `window.supabase` への直接コールは削除します。

### 2. `loadProject` メソッドの修正
**現状:**
*   Supabase DB からメタデータを取得。
*   `storage_path` を元に Supabase Storage から JSON ファイルをダウンロード。
*   クライアントで JSON パース。

**修正後:**
*   `GET /api/projects/[id]` エンドポイントを使用します。
*   API が JSON データ自体をレスポンスボディとして返す仕様のため、SDKによるStorageダウンロード処理を削除し、APIレスポンスをそのままパースして返却します。

### 3. `getThumbnailUrl` メソッドの修正
**現状:**
*   Supabase Storage の `createSignedUrl` メソッドを使用して署名付き URL を生成。

**修正後:**
*   `GET /api/projects/[id]/thumbnail` エンドポイントを使用します。
*   API は画像バイナリを返すため、`fetch` で Blob として取得し、`URL.createObjectURL(blob)` を使用してブラウザ用の表示 URL (Object URL) を生成して返します。
*   **注意:** API呼び出しには Authorization Header が必要なため、`<img>` タグの `src` に直接 API の URL を指定することはできません。そのため、一度 JS で fetch して Blob URL に変換するこの方式を採用します。
*   これにより、サムネイル画像の取得も完全に API 経由となり、Storage への直接アクセスはなくなります。

### 4. クリーンアップ
*   不要となる以下のメソッド・処理を削除します。
    *   `_generateUUID` (APIがID生成を担当するため不要)
    *   `_dataURLToBlob` (APIがBase64を受け取るため不要)
    *   `saveProject`, `loadProject`, `getThumbnailUrl` 内の `window.supabase` 関連コードすべて。

## API仕様との整合性確認

| 項目 | API仕様 (`API_SPECIFICATION.md`) | 修正後の実装方針 |
| :--- | :--- | :--- |
| **保存 (POST)** | `thumbnail`: Base64文字列を受け取り、サーバ側でデコード・保存 | `saveProject` で Base64 文字列をそのまま送信する |
| **読込 (GET)** | JSONデータをレスポンスボディとして返却 | `loadProject` でレスポンスをそのまま利用する |
| **サムネイル (GET)** | `/api/projects/[id]/thumbnail` でバイナリ返却 | `fetch` で Blob 取得し ObjectURL を生成する |

## 影響範囲
*   `CloudLoadModal.js`: `getThumbnailUrl` が返す URL (Promise) を使用して画像を表示しています。修正後も Promise が URL 文字列（Object URL）を解決するインターフェースを維持するため、**`CloudLoadModal.js` 側の修正は不要**です。
*   `Ui.js`: `saveProject` を呼び出しています。引数や戻り値（Promise）のインターフェースに変更はないため、**`Ui.js` 側の修正は不要**です。
