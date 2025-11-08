# Tilegrams

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

Then access `http://localhost:8080/`.

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

## Dependencies

JavaScript is written in [ES2015](https://babeljs.io/docs/learn-es2015/)
using [Babel](https://babeljs.io/). Styles are written in
[SASS](http://sass-lang.com/). All assets are preprocessed with
[webpack](https://webpack.github.io/).

The Maker also depends on a pre-release `npm` version of `topogram`
(formerly `cartogram.js`) as seen in
[this PR](https://github.com/shawnbot/topogram/pull/26).

## Data Sources
[US Population Data](http://factfinder.census.gov/faces/tableservices/jsf/pages/productview.xhtml?pid=PEP_2015_PEPANNRES&prodType=table)

[Electoral Votes Data](https://www.archives.gov/federal-register/electoral-college/allocation.html)

[GDP Data](http://www.bea.gov/itable/)

[France Population Data](https://en.wikipedia.org/wiki/Ranked_list_of_French_regions)

## Base Map Sources
US states map:
[Natural Earth Data](http://www.naturalearthdata.com/downloads/)

<!---UK constituency map:
[Ordnancesurvey.co.uk](https://www.ordnancesurvey.co.uk/opendatadownload/products.html)
Contains OS data © Crown copyright and database right (2017),
[Ordnance Survey of Northern Ireland](http://osni.spatial-ni.opendata.arcgis.com/datasets/563dc2ec3d9943428e3fe68966d40deb_3)
Contains public sector information licensed under the terms of the Open Government Licence v3.0.

UK local authority map:
[http://geoportal.statistics.gov.uk/](http://geoportal.statistics.gov.uk/datasets/686603e943f948acaa13fb5d2b0f1275_2)
Contains OS data © Crown copyright and database right (2017),
[Ordnance Survey of Northern Ireland](http://osni-spatial-ni.opendata.arcgis.com/datasets/a55726475f1b460c927d1816ffde6c72_2)
Contains public sector information licensed under the terms of the Open Government Licence v3.0.--->

Germany constituency map:
[Bundeswahlleiter.de](https://www.bundeswahlleiter.de/en/bundestagswahlen/2017/wahlkreiseinteilung/downloads.html)
© Der Bundeswahlleiter, Statistisches Bundesamt, Wiesbaden 2016,
Wahlkreiskarte für die Wahl zum 19. Deutschen Bundestag
Basis of the geological information © Geobasis-DE / BKG (2016)

# License

This software is distributed under the [ISC](https://spdx.org/licenses/ISC.html)
license.
