import dat from 'dat-gui'
import {isDevEnvironment} from './utils'

// re-read on resize: moving the window to another display can change it
let devicePixelRatio = window.devicePixelRatio || 1

const canvasDimensions = {
  width: 0,
  height: 0,
}
/**
 * update canvasDimensions ensuring that there is always a min w/h
 * prevent errors on small screens
 */
function updateCanvasSize() {
  devicePixelRatio = window.devicePixelRatio || 1
  const canvasContainer = document.getElementById('canvas')
  canvasDimensions.width = Math.max(200, canvasContainer.offsetWidth * devicePixelRatio)
  canvasDimensions.height = Math.max(200, canvasContainer.offsetHeight * devicePixelRatio)
}

/**
 * target min and max number of tiles for map output
 * used to calculate a dataset's domain
 */
const nTileDomain = [80, 1000]

/** dat.gui for realtime updating of properties */
class Settings {
  constructor() {
    this.tileScale = 0.95
    this.displayMap = true
    this.displayGrid = true
    // 'auto' = cull overlapping labels, 'all' = draw all, 'none' = hide
    this.labelMode = 'auto'
  }
}
const settings = new Settings()
// debug panel (press "h" to toggle), dev server only
if (isDevEnvironment()) {
  const gui = new dat.GUI()
  gui.add(settings, 'tileScale', 0.9, 1.0)
  gui.add(settings, 'displayMap')
  gui.add(settings, 'displayGrid')
  dat.GUI.toggleHide()
}

/** font stack for canvas/SVG labels, with Japanese fallbacks */
const labelFontFamily =
  "'Fira Sans', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif"

const tileEdgeRange = {
  default: 20,
  min: 10,
  max: 40,
}
const selectedTileBorderColor = '#737373'
const hoveredTileBorderColor = '#737373'
const movingTileOriginalPositionColor = '#d0d2d3'

export {
  settings,
  devicePixelRatio,
  canvasDimensions,
  updateCanvasSize,
  nTileDomain,
  labelFontFamily,
  tileEdgeRange,
  selectedTileBorderColor,
  hoveredTileBorderColor,
  movingTileOriginalPositionColor,
}
