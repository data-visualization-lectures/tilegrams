# タイルグラムの作成

「タイルグラム」とは、データセットに比例した大きさの領域をタイル状に並べた地図のことです。
その名は、タイル状の[カートグラム](https://en.wikipedia.org/wiki/Cartogram)の略称として付けました。

タイルグラムは、従来の地理的な地図に比べて、馴染みのある外観を保ちながら、人口統計データをより正確に表現することができます。

このフリーでオープンソースのツールは、ニュースデザイナーや開発者が、既存のタイルグラムを閲覧したり、独自のタイルグラムを作成して、インタラクティブなウェブ向けや紙面向けに作ることができます。

タイルグラムは、コンピュータで自動化されていても、作成には時間がかかります。というのも、タイルグラムを効果的に使うためには、地理的な輪郭が一般の読者に認識され、意味があるかどうかを人間の目で確認する必要があるからです。そのため、自分のタイルグラムを作る前に、既存のタイルグラムから始めることをお勧めします。

このプロジェクトについては、私たちの[ブログ記事](http://pitchinteractive.com/latest/tilegrams-more-human-maps/)での発表もご覧ください。

このマニュアルは、最も基本的な使用方法から最も高度な使用方法までを説明しています。

## 既存のタイルグラムのエクスポート

読み込み時には、**Load existing** メニューで選択されている、既製のタイルグラムが表示されます。他のオプションも選択してみてください。

表示されたタイルグラムに問題がなければ、左下のボタンを使って **TopoJSON** または **SVG** として **エクスポート** します。

デザイナーはSVGを好みのソフトウェア（例：Illustrator）に取り込むことができ、開発者はTopoJSONをウェブアプリケーションに取り込むことができます。いずれの場合も、データは米国の[FIPS](https://en.wikipedia.org/wiki/Federal_Information_Processing_Standards)コードで識別されます。

## タイルグラムの編集

例えば、タイルグラムを読み込んだ後、ある地域の形を変えたいとします。例えば、フロリダが重すぎたり、ミズーリが細すぎたりします。

Click step **2**: **Refine your tilegram**.

### Moving tiles around

タイルをクリック＆ドラッグして移動させることができます。

To move many tiles around, click and drag a
rectangular marquee around them, and then drag them around.

To move just a specific region around, double-click
any tile in it to select them all—then drag them around.

You can also hover over a region in the **State Tiles**
sidebar area to see that region's tiles highlighted on the map.

### 統計精度の確保

Under **State Tiles**, you'll see a list of each state with a number and a
hexagon.

The number indicates the _delta inaccuracy_ between the number of tiles that
region _currently_ has on the map and how many it _should_ have, based on the
dataset. If the delta is positive, that region has too many tiles on the map.
If the delta is negative, it doesn't have enough tiles on the map. If there is
a warning sign, then that region doesn't have enough data for even a single tile
on the map at the chosen resolution.

(_Why does this happen?_ It is computationally very difficult to produce
tilegrams which are accurate _and_ recognizable. As you begin to make
cartograms, you'll appreciate the difficult trade-offs you must make between
preserving the approximate shapes of regions and their adjacency to other
regions.)

To remove a tile from the map, click it, and hit 'Delete' on your keyboard.

To add a tile to the map, click the hexagon from the left sidebar and drag it
onto the map.

## 新しいタイルグラムの生成

If you've made it this far, you are ready to produce your own tilegram.

Select **Generate from data**. You will see the tilegram generated before your
eyes, by beginning with a conventional geographic map and then progressively
resizing its regions to conform to the selected dataset.

Under **Dataset**, you may select one of a few prepared datasets, or input
your own **Custom CSV**, by pasting in a dataset in the format specified,
using US FIPS codes.

Then you may alter the resolution in two ways. The most visually gratifying is
to click and grab the **Resolution** slider and watch as the tiles are
re-computed in realtime. The other, more statistically accurate way is to click
into the **Per tile** field and entire your desired value per tile.

For example, if you are using population to scale the regions of your tilegram,
you might enter '500,000' so that each tile corresponds to (approximately) five
hundred thousand people. Then, each region's number of tiles is rounded to the
nearest multiple of that number. So, in this same example, if you have a region
with 700,000 people, the metrics would show that you need one tile and if you
have a region with 800,000 people it would round up to two tiles.

As you adjust the **Dataset** and **Resolution**/**Per tile**, you'll notice
that the _deltas_ under **State Tiles** update dynamically. Please remember
to take note of them and ensure that they all read `0` to make responsible
tilegrams.

##  エクスポートされたタイルグラムの利用

### In D3

[D3](https://d3js.org/)で使用するために、SVGまたはTopoJSONのいずれかをエクスポートすることができます。
以下の例では、D3 v4を使用し、このホストされたバージョンに対してテストしています。


```html
<script type="text/javascript" src="https://d3js.org/d3.v4.min.js"></script>
```

#### タイルグラムSVGをD3でレンダリングする

最もシンプルなD3の統合は、SVGをDOMに書き出してから インタラクティビティのためのハンドラーを追加することです。

```javascript
var WIDTH = 800

d3.text('tiles.svg', (e, data) => {
  var div = d3.select(document.body).append('div').html(data)
  var svg = div.select('svg')
  var groups = svg.selectAll('g')

  // Scale SVG
  var importedWidth = parseInt(svg.attr('width'))
  var importedHeight = parseInt(svg.attr('height'))
  var scale = WIDTH / importedWidth
  svg
    .attr('width', importedWidth * scale)
    .attr('height', importedHeight * scale)
  groups.attr('transform', 'scale(' + scale + ')')

  // Apply handlers
  groups.on('click', (e) => {
    console.log('Clicked', d3.event.target.parentNode.id)
  })
})
```

#### タイルグラムTopoJSONをD3でレンダリングする

D3でタイルグラムのTopoJSONを表示する際には、TopoJSONの座標が緯度・経度を参照していないため、地理的な投影法を使用しないことが重要です。
というのも、TopoJSONの座標は緯度・経度ではなく、無次元のユークリッド空間を参照しているからです。

また、現在は地図を縦に反転させる必要があります。これは エクスポートされたタイルグラムの座標は、原点(`0, 0`)が左下隅にあると仮定しているのに対し、プロジェクションレス・レンダリングでは左上にあると仮定しているからです。下の `transform` に注目してください。

まず、`topojson`を必ずインポートしてください：

```html
<script type="text/javascript" src="http://d3js.org/topojson.v1.min.js"></script>
```

それから：

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

各州の周りにボーダーを描く：

```javascript
// Build list of state codes
var stateCodes = []
tilegram.objects.tiles.geometries.forEach(function(geometry) {
  if (stateCodes.indexOf(geometry.properties.state) === -1) {
    stateCodes.push(geometry.properties.state)
  }
})

// Build merged geometry for each state
var stateBorders = stateCodes.map(function(code) {
  return topojson.merge(
    tilegram,
    tilegram.objects.tiles.geometries.filter(function(geometry) {
      return geometry.properties.state === code
    })
  )
})

// Draw path
g.selectAll('path.border')
  .data(stateBorders)
  .enter().append('path')
  .attr('d', path)
  .attr('class', 'border')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('stroke-width', 4)
```

## タイルグラムをシェアしよう

使ってみて、楽しめたり、使いづらいことがあれば、[@pitchinc](http://twitter.com/pitchinc) もしくは [info@pitchinteractive.com](mailto:info@pitchinteractive.com)まで、ぜひ聞かせてください！
今後は、より多くのタイルグラム例をアプリケーションに掲載していきたいと考えています。
ハッピー・タイルグラム！