import MobileDetect from 'mobile-detect'
import canvas from './source/Canvas'
import ui from './source/Ui'
import {
  loadProject,
  selectGeography,
} from './source/TilegramController'
import {
  buildProjectJson,
  exportSvg,
  exportTopoJson,
  getCanvasThumbnailDataUri,
} from './source/ExportController'
import installAppBindings from './source/AppBindings'
import installToolHeader from './source/ToolHeaderIntegration'
import gridGeometry from './source/geometry/GridGeometry'

import {
  isDevEnvironment,
} from './source/utils'
import {updateCanvasSize} from './source/constants'

import logo from './source/images/logo.png' // eslint-disable-line no-unused-vars

require('./source/css/main.scss')
require('font-awesome/scss/font-awesome.scss')
require('./source/css/toast.scss')

const defaultGeography = 'Japan'

if (typeof window !== 'undefined') {
  const mobileDetect = new MobileDetect(window.navigator.userAgent)
  const isMobile = mobileDetect.mobile()
  if (isMobile) {
    document.body.className = 'isMobile'
  }
}

function confirmNavigation(e) {
  // most browsers won't let you display custom text but have something like this anyway
  const message = '本当にこのページから離脱しますか？セーブされていない作業がすべて失われます。'
  e.returnValue = message
  return message
}

function init() {
  installAppBindings()
  selectGeography(defaultGeography)

  if (!isDevEnvironment()) {
    window.addEventListener('beforeunload', confirmNavigation)
  }
}

function resize() {
  updateCanvasSize()
  canvas.resize()
  gridGeometry.resize()
  canvas.getMap().updatePreProjection()
}
window.onresize = resize
resize()

// Ignore ctrl-Z altogether
document.addEventListener('keydown', event => {
  if (event.metaKey && event.key === 'z') {
    event.preventDefault()
  }
})

init()

installToolHeader({
  loadProject,
  getGeography: () => ui.getGeography(),
  buildProjectJson,
  getThumbnailDataUri: getCanvasThumbnailDataUri,
  exportTopoJson,
  exportSvg,
  exportPng: () => ui.exportPng(),
})
