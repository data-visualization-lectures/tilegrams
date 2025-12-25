# タイルグラムの作り方

「タイルグラム」はタイル（六角形）で構成された地図で、各地域のサイズがデータ値に比例します。単語は tiled [cartogram](https://en.wikipedia.org/wiki/Cartogram) の略です。地理的な位置関係を保ちつつ人口などの統計をより正確に示せるのが利点です。

このオープンソースツールを使うと、既存のタイルグラムを閲覧したり、自分専用のタイルグラムを作ってインタラクティブ記事や紙面に利用できます。

自動処理を挟んでも、タイルグラムは「人が見てわかりやすい形」を保つ必要があるため時間がかかることがあります。まずは既存のタイルグラムをベースに編集する方法から始めると効率的です。

詳しい背景は [ブログ記事](http://pitchinteractive.com/latest/tilegrams-more-human-maps/) を参照してください。

このマニュアルは基本操作から高度な使い方へ順番に説明します。

## 既存タイルグラムのエクスポート

起動するとまず **Load existing** メニューで選ばれたタイルグラムが表示されます。別のオプションを試しながら内容を確認してください。

表示どおりの状態で問題なければ、左下の **Export** ボタンから **TopoJSON** または **SVG** を出力できます。

SVG はデザイナーが Illustrator などへ読み込めます。TopoJSON は開発者が Web アプリへ組み込めます。どちらにも米国 [FIPS](https://en.wikipedia.org/wiki/Federal_Information_Processing_Standards) コードが付与されます。

## タイルグラムの編集

既存タイルグラムを読み込んだあと、例えばフロリダが大きすぎたりミズーリが細長すぎたりすると感じたら手動で調整できます。

ステップ **2** の **Refine your tilegram** をクリックします。

### タイルを移動する

- 任意のタイルをドラッグすると移動できます。
- 複数タイルをまとめて動かしたい場合は矩形選択で囲んでからドラッグします。
- 特定の州だけ移動したい場合は、その州のタイルをダブルクリックして全選択し、まとめてドラッグします。
- 右側の **State Tiles** リストの州にマウスを乗せると該当タイルが地図上でハイライトされます。

### 数値の整合性を保つ

**State Tiles** には各州の名前、数字、六角形アイコンが並びます。

数字は現在のタイル数と、データ上「あるべき」タイル数との差（デルタ）です。正ならタイルが多すぎ、負なら足りません。警告アイコンが出ている場合は、選択した解像度で 1 タイル分のデータすら満たしていないことを意味します。

> なぜこうなるのか?  
> タイルグラムは「統計的に正確」で「地図として認識できる形」を同時に満たすのが難しく、形状や隣接関係を保とうとすると誤差が生まれます。

- タイルを削除するにはタイルを選んでキーボードの Delete を押します。
- タイルを追加するには左サイドバーの六角形をドラッグして地図上に置きます。

## 新規タイルグラムの生成

ここまで理解できたら、ゼロからタイルグラムを作る準備が整っています。

**Generate from data** を選ぶと、通常の地図から選択したデータに合わせて領域が徐々にリサイズされていく様子が見られます。

**Dataset** では用意済みのデータセットを選ぶか、FIPS コード形式の **Custom CSV** を貼り付けて独自データを投入できます。

解像度は次の 2 通りで調整します。

1. **Resolution** スライダーをドラッグしてリアルタイムにタイル再計算を確認する方法。
2. **Per tile** 入力欄に 1 タイルあたりの値を直接入力する、より厳密な方法。

例えば人口データを使う場合、`500,000` と入力すると 1 タイル ≒ 50 万人になります。各州の人口をその値で割り、最も近い整数に丸めたタイル数が割り当てられます。人口 70 万なら 1 タイル、80 万なら 2 タイル、といった具合です。

**Dataset** と **Resolution**/**Per tile** を変えると **State Tiles** のデルタが自動更新されます。最終的にはすべてが `0` になるよう調整し、責任あるタイルグラムを作成してください。

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

d3.text('tiles.svg', (e, data) => {
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

d3.json('tiles.topo.json', function showData(error, tilegram) {
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

各州の境界線を描くには、州ごとにタイルをマージしたパスを作ります。

```javascript
// 州コード一覧を作成
var stateCodes = []
tilegram.objects.tiles.geometries.forEach(function(geometry) {
  if (stateCodes.indexOf(geometry.properties.state) === -1) {
    stateCodes.push(geometry.properties.state)
  }
})

// 州ごとにジオメトリをマージ
var stateBorders = stateCodes.map(function(code) {
  return topojson.merge(
    tilegram,
    tilegram.objects.tiles.geometries.filter(function(geometry) {
      return geometry.properties.state === code
    })
  )
})

// 描画
g.selectAll('path.border')
  .data(stateBorders)
  .enter().append('path')
  .attr('d', path)
  .attr('class', 'border')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('stroke-width', 4)
```

## タイルグラムの共有

このツールを活用した、または改善案がある場合は [@pitchinc](http://twitter.com/pitchinc) もしくは [info@pitchinteractive.com](mailto:info@pitchinteractive.com) までぜひご連絡ください。今後もタイルグラムの事例をアプリに追加していく予定です。

それでは楽しいタイルグラム制作を!
