const assert = require('assert')
const {installBrowserStubs} = require('./helpers/browserStubs')

const {canvasContainer} = installBrowserStubs({canvasSize: {width: 800, height: 600}})
const {updateCanvasSize, canvasDimensions} = require('../source/constants')
const gridGeometry = require('../source/geometry/GridGeometry').default

updateCanvasSize()
gridGeometry.setTileEdge(20)

// screen coordinates of a tile center map back to the same grid position
;[{x: 0, y: 0}, {x: 3, y: 4}, {x: 10, y: 7}, {x: 5, y: 12}].forEach(position => {
  const center = gridGeometry.tileCenterPoint(position)
  assert.deepStrictEqual(gridGeometry.getPositionFromScreen(center.x, center.y), position)
})

// growing the canvas scales tiles by the limiting dimension
canvasContainer.offsetWidth = 1600
canvasContainer.offsetHeight = 900
updateCanvasSize()
assert.deepStrictEqual(canvasDimensions, {width: 1600, height: 900})
gridGeometry.rescaleToCanvas()
assert.strictEqual(gridGeometry.getTileEdge(), 30)

// shrinking back restores the original tile size
canvasContainer.offsetWidth = 800
canvasContainer.offsetHeight = 600
updateCanvasSize()
gridGeometry.rescaleToCanvas()
assert.strictEqual(gridGeometry.getTileEdge(), 20)

console.log('GridGeometry tests passed')
