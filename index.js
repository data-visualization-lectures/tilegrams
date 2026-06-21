import MobileDetect from 'mobile-detect'
import canvas from './source/Canvas'
import ui from './source/Ui'
import metrics from './source/Metrics'
import exporter from './source/file/Exporter'
import pngExporter from './source/file/PngExporter'
import {
  loadProject,
  loadTopoJson,
  selectCustomDataset,
  selectDataset,
  selectGeography,
  selectTilegram,
  updateResolution,
  updateUi,
} from './source/TilegramController'
import installToolHeader from './source/ToolHeaderIntegration'
import gridGeometry from './source/geometry/GridGeometry'
import projectExporter from './source/file/ProjectExporter'

import {
  startDownload,
  isDevEnvironment,
} from './source/utils'
import {updateCanvasSize} from './source/constants'

import logo from './source/images/logo.png' // eslint-disable-line no-unused-vars

require('./source/css/main.scss')
require('font-awesome/scss/font-awesome.scss')
require('./source/css/toast.scss')

const defaultGeography = 'United States'

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

function getCurrentTiles() {
  return canvas.getGrid().getTiles()
}

function buildTopoJson(geography) {
  return exporter.toTopoJson(
    getCurrentTiles(),
    ui.getSelectedDataset(),
    metrics.metricPerTile,
    geography
  )
}

function buildSvg(geography) {
  return exporter.toSvg(
    getCurrentTiles(),
    geography
  )
}

function buildProjectJson(geography) {
  return projectExporter.export(
    getCurrentTiles(),
    ui.getSelectedDataset(),
    metrics.metricPerTile,
    geography
  )
}

function exportTopoJson(geography) {
  startDownload({
    filename: 'tiles.topo.json',
    mimeType: 'text/plain',
    content: JSON.stringify(buildTopoJson(geography)),
  })
}

function exportSvg(geography) {
  startDownload({
    filename: 'tiles.svg',
    mimeType: 'image/svg+xml',
    content: buildSvg(geography),
  })
}

function exportProjectJson(geography) {
  startDownload({
    filename: 'tilegram-project.json',
    mimeType: 'application/json',
    content: buildProjectJson(geography),
  })
}

function getCanvasThumbnailDataUri() {
  return pngExporter.toDataUrl()
}

function init() {
  // wire up callbacks
  canvas.getGrid().onChange(() => updateUi())
  canvas.getGrid().setUiEditingCallback(() => ui.setEditingTrue())
  ui.setAddTileCallback(id => canvas.getGrid().onAddTileMouseDown(id))
  ui.setDatasetSelectedCallback(selectDataset)
  ui.setTilegramSelectedCallback(selectTilegram)
  ui.setCustomDatasetCallback(selectCustomDataset)
  ui.setHightlightCallback(id => canvas.getGrid().onHighlightGeo(id))
  ui.setUnhighlightCallback(() => canvas.getGrid().resetHighlightedGeo())
  ui.setResolutionChangedCallback(updateResolution)
  ui.setUnsavedChangesCallback(() => canvas.getGrid().checkForEdits())
  ui.setResetUnsavedChangesCallback(() => canvas.getGrid().resetEdits())
  ui.setExportCallback(geography => {
    exportTopoJson(geography)
  })
  ui.setExportSvgCallback(geography => {
    exportSvg(geography)
  })
  ui.setImportCallback(loadTopoJson)
  ui.setGeographySelectCallback(selectGeography)
  ui.setSaveProjectCallback(geography => {
    exportProjectJson(geography)
  })
  ui.setLoadProjectCallback(loadProject)

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
