# タイルグラムの作り方

「タイルグラム」はタイル（六角形）で構成された地図で、各地域のサイズがデータ値に比例します。単語は tiled [cartogram](https://en.wikipedia.org/wiki/Cartogram) の略です。地理的な位置関係を保ちつつ人口などの統計をより正確に示せるのが利点です。

このオープンソースツールを使うと、既存のタイルグラムを閲覧したり、自分専用のタイルグラムを作ってインタラクティブ記事や紙面に利用できます。

自動処理を挟んでも、タイルグラムは「人が見てわかりやすい形」を保つ必要があるため時間がかかることがあります。まずは既存のタイルグラムをベースに編集する方法から始めると効率的です。

詳しい背景は [ブログ記事](http://pitchinteractive.com/latest/tilegrams-more-human-maps/) を参照してください。

このマニュアルは基本操作から高度な使い方へ順番に説明します。

## 既存タイルグラムのエクスポート

起動するとまず「**1. 開く・作成する**」の「**完成済みタイルグラムを開く**」で選ばれたタイルグラム（初期状態では「日本 都道府県 1対1」）が表示されます。別のオプションを試しながら内容を確認してください。

表示どおりの状態で問題なければ、画面上部の「**エクスポート**」メニューから **TopoJSON**・**SVG**・**PNG** を出力できます。

SVG はデザイナーが Illustrator などへ読み込めます。地域名ラベルは `labels` グループにまとめて入っているので、不要な場合はグループごと削除できます。TopoJSON は開発者が Web アプリへ組み込めます。日本の地図には都道府県コード（1〜47）、米国の地図には [FIPS](https://en.wikipedia.org/wiki/Federal_Information_Processing_Standards) コードが付与されます。

## タイルグラムの編集

既存タイルグラムを読み込んだあと、例えば北海道が大きすぎたり長野県が細長すぎたりすると感じたら手動で調整できます。

ステップ「**2. タイルを調整する**」をクリックします。

### タイルを移動する

- 任意のタイルをドラッグすると移動できます。
- 複数タイルをまとめて動かしたい場合は矩形選択で囲んでからドラッグします。
- 特定の都道府県だけ移動したい場合は、そのタイルをダブルクリックして全選択し、まとめてドラッグします。
- 右側のタイル一覧の地域名にマウスを乗せると該当タイルが地図上でハイライトされます。

### 数値の整合性を保つ

タイル一覧には各地域の名前、数字、六角形アイコンが並びます。

数字は現在のタイル数と、データ上「あるべき」タイル数との差（デルタ）です。正ならタイルが多すぎ、負なら足りません。警告アイコンが出ている場合は、選択した解像度で 1 タイル分のデータすら満たしていないことを意味します。

> なぜこうなるのか?  
> タイルグラムは「統計的に正確」で「地図として認識できる形」を同時に満たすのが難しく、形状や隣接関係を保とうとすると誤差が生まれます。

- タイルを削除するにはタイルを選んでキーボードの Delete を押します。
- タイルを追加するには左サイドバーの六角形をドラッグして地図上に置きます。

## 新規タイルグラムの生成

ここまで理解できたら、ゼロからタイルグラムを作る準備が整っています。

「**地図とデータから新規作成**」を選ぶと、通常の地図から選択したデータに合わせて領域が徐々にリサイズされていく様子が見られます。

データセットの選択肢では用意済みのデータセットを選ぶか、「**カスタムCSV（貼り付け）**」で独自データを投入できます。

解像度は次の 2 通りで調整します。

1. スライダーをドラッグしてリアルタイムにタイル再計算を確認する方法。
2. 入力欄に 1 タイルあたりの値を直接入力する、より厳密な方法。

例えば人口データを使う場合、`500,000` と入力すると 1 タイル ≒ 50 万人になります。各地域の人口をその値で割り、最も近い整数に丸めたタイル数が割り当てられます。人口 70 万なら 1 タイル、80 万なら 2 タイル、といった具合です。

データセットや解像度を変えるとタイル一覧のデルタが自動更新されます。最終的にはすべてが `0` になるよう調整し、責任あるタイルグラムを作成してください。

## カスタムCSVの書式（日本の地図）

CSV はヘッダー行なしで、1 列目に地域ID、2 列目に値を記入します。日本の地図（都道府県・東京都）では、1 列目に次のいずれの形式も使えます。

- 都道府県コード: `1`〜`47`（`01` のような0埋めも可）
- ISO 3166-2 コード: `JP-13` など
- 都道府県名: `東京都`・`東京` など（正式名称・短縮名のどちらも可）
- 東京都の地図では市区町村コード（例: `131016`）または市区町村名（例: `千代田区`）。なお東京都の地図は23区と多摩地域を対象とし、島しょ部は含みません

値の列は `1,234,567` のような桁区切りカンマや全角数字も受け付けます。ヘッダー行が混ざっていた場合は自動的にスキップされます。

例（都道府県の人口）:

```
北海道,5224614
青森県,1237984
東京都,14047594
```

政府統計の総合窓口 [e-Stat](https://www.e-stat.go.jp/) などからダウンロードした統計表は、「都道府県名の列」と「値の列」の 2 列に整形してから貼り付けてください。

## エクスポートしたタイルグラムの利用

### D3.js で使う場合

出力した SVG / TopoJSON は [D3](https://d3js.org/) で扱えます。以下は D3 v4 で検証した例です。

```html
<script type="text/javascript" src="https://d3js.org/d3.v4.min.js"></script>
```

#### SVG を D3 で描画する

もっとも手軽なのは、SVG をそのまま DOM に挿入し、必要ならイベントを付ける方法です。

```javascript
var WIDTH = 800

d3.text('japan-tilegram.svg', (e, data) => {
  var div = d3.select(document.body).append('div').html(data)
  var svg = div.select('svg')
  var groups = svg.selectAll('g')

  // 幅を調整
  var importedWidth = parseInt(svg.attr('width'))
  var importedHeight = parseInt(svg.attr('height'))
  var scale = WIDTH / importedWidth
  svg
    .attr('width', importedWidth * scale)
    .attr('height', importedHeight * scale)
  groups.attr('transform', 'scale(' + scale + ')')

  // クリックイベントの例
  groups.on('click', () => {
    console.log('Clicked', d3.event.target.parentNode.id)
  })
})
```

#### TopoJSON を D3 で描画する

TopoJSON の座標は緯度経度ではなくユークリッド座標なので、地理投影は使用しません。さらに座標の原点が左下にある前提のため、垂直方向を反転させる必要があります（`transform` を参照）。

`topojson` も読み込みます。

```html
<script type="text/javascript" src="http://d3js.org/topojson.v1.min.js"></script>
```

描画例:

```javascript
var WIDTH = 1400
var HEIGHT = 1000

var svg = d3.select('body').append('svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)

d3.json('japan-tilegram.topo.json', function showData(error, tilegram) {
  var tiles = topojson.feature(tilegram, tilegram.objects.tiles)

  var transform = d3.geoTransform({
    point: function(x, y) {
      this.stream.point(x, -y)
    }
  })

  var path = d3.geoPath().projection(transform)

  var g = svg.append('g')
    .attr('transform', 'translate(0,' + HEIGHT + ')')

  g.selectAll('.tiles')
    .data(tiles.features)
    .enter().append('path')
    .attr('d', path)
})
```

各地域の境界線を描くには、地域ごとにタイルをマージしたパスを作ります。エクスポートされた TopoJSON の各ジオメトリには `properties.name`（地域名）が入っています。

```javascript
// 地域名一覧を作成
var regionNames = []
tilegram.objects.tiles.geometries.forEach(function(geometry) {
  if (regionNames.indexOf(geometry.properties.name) === -1) {
    regionNames.push(geometry.properties.name)
  }
})

// 地域ごとにジオメトリをマージ
var regionBorders = regionNames.map(function(name) {
  return topojson.merge(
    tilegram,
    tilegram.objects.tiles.geometries.filter(function(geometry) {
      return geometry.properties.name === name
    })
  )
})

// 描画
g.selectAll('path.border')
  .data(regionBorders)
  .enter().append('path')
  .attr('d', path)
  .attr('class', 'border')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('stroke-width', 4)
```
