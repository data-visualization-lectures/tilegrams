# Tilegrams


nvm install 16.20.2 && nvm use 16.20.2

<!-- npm i -->
npm install --legacy-peer-deps

npm start
npm start -- --port 8081

http://localhost:8081/?auth_debug

npm run build

---

## Development

### Setup

After cloning the repository, run:

    npm i

#### Node / Python バージョン指定

このプロジェクトの依存関係（特に `node-sass@4`）は古いツールチェーンを前提としているため、以下の環境でセットアップしてください。

1. **Node.js 16 系**  
   `nvm install 16.20.2 && nvm use 16.20.2` のようにして LTS v16 を選択します。
2. **Python 2.7.18（pyenv）**  
   ```
   pyenv install 2.7.18
   cd /Users/yuichiyazaki/Library/CloudStorage/Dropbox/Projects_講義/c_DataVizLectures/_app/tilegrams
   pyenv local 2.7.18
   ```
   これにより `.python-version` が作成され、このディレクトリ内では Python 2 が自動的に有効になります。
3. `.npmrc` で `python=/Users/yuichiyazaki/.pyenv/shims/python` を指すようにしています。ご自身の環境に合わせて絶対パスを書き換えるか、`npm config set python "$(pyenv which python)"` でユーザー設定を上書きしてください。こうすることで pyenv 管理下の Python 2.7 が `node-gyp`（= `node-sass` のビルド）に使われます。

### Running / ローカルで確認

Run

    npm start

http://localhost:8080/
http://localhost:8080/?auth_debug


### Deploying / デプロイ

本プロジェクトでは、まずローカルでビルドを行い、出力された静的ファイルをNetlifyに配置する方式を推奨しています。

1. 依存関係をインストール済みであることを確認したら、`npm run build` を実行します。生成物は `dist/` に書き出されます。
2. `netlify.toml` では、ビルドコマンド（`npm run build`）、公開ディレクトリ（`dist/`）、Node.jsバージョン（`16.20.2`）、`netlify dev` で利用するローカル開発サーバー（`npm start`）を指定しています。NetlifyのCI/CDを利用する場合は、この設定に従って自動的に同じビルドが走ります。
3. 「ローカルでビルド → Netlifyへ静的ファイルをアップロード」という運用では、ビルド後に `netlify deploy --prod --dir=dist` を実行して `dist/` 以下を本番にデプロイします。プレビュー用であれば `--prod` を外して同コマンドを実行してください。
4. Netlify Devで開発環境を再現したい場合は `netlify dev` を実行すると、内部で `npm start`（webpack dev server, port 8080）が立ち上がり、実際のホスティング環境と同様の挙動を確認できます。

### Troubleshooting / トラブルシューティング

- **ポート 8080 が既に使用されている (`EADDRINUSE`)**  
  開発サーバーが起動できない場合は、占有しているプロセスを調べて終了します。  
  ```bash
  lsof -i tcp:8080
  kill <PID>   # 不要なプロセスを終了
  ```

- **`node-sass` の再ビルドが必要な場合**  
  Node バージョンを切り替えた後などで `node-sass` が壊れた場合は、プロジェクトルートで以下を実行してください。  
  ```bash
  nvm use 16.20.2
  npm rebuild node-sass
  ```


## ベースマップの追加の仕方

### 指定している箇所

/Users/yuichiyazaki/Documents/GitHubRepository/_app_fork/tilegrams/source/resources/GeographyResource.js

### 地形ファイル置き場

#### TopoJSONファイル
./maps/japan/japan.topo.json

#### 地域名データ (IDと名前の対応表) 
フォルダを作成
./data/japan/japan-names.json