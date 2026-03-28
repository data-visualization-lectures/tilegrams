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

本プロジェクトでは、ローカルでビルドしたファイル（`dist/`）を Git にコミットして GitHub に push することで、Netlify が自動的にデプロイします。

#### デプロイ手順

1. ソースコードを修正したら、通常通りコミットします：
   ```bash
   git add index.js source/Ui.js  # など、変更ファイルを add
   git commit -m "変更内容"
   ```

2. ローカルでビルドします：
   ```bash
   npm run build
   ```
   生成物は `dist/` に書き出されます。

3. ビルド出力を add してコミットします：
   ```bash
   git add -f dist/  # .gitignore に dist が記載されているため -f フラグが必要
   git commit -m "ビルド出力を更新"
   ```

4. GitHub に push します：
   ```bash
   git push origin master
   ```

5. push されると、Netlify が自動的に検知してビルド＆デプロイします。

**補足：** 古い Node.js バージョン（16系）や Python 2.7 の依存関係がある関係上、CI/CD による自動ビルドではなく、ローカルでビルドしたファイルを直接コミットする運用になっています。Netlify はこのコミットを検知して本番環境にデプロイします。

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