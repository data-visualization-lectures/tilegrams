import MobileDetect from 'mobile-detect'
import canvas from './source/Canvas'
import ui from './source/Ui'
import metrics from './source/Metrics'
import exporter from './source/file/Exporter'
import importer from './source/file/Importer'
import datasetResource from './source/resources/DatasetResource'
import geographyResource from './source/resources/GeographyResource'
import tilegramResource from './source/resources/TilegramResource'
import gridGeometry from './source/geometry/GridGeometry'
import projectExporter from './source/file/ProjectExporter'
import projectImporter from './source/file/ProjectImporter'

import {
  startDownload,
  isDevEnvironment,
  getQueryParam,
  showProcessingToast,
  installHeaderProcessingToasts,
} from './source/utils'
import { updateCanvasSize } from './source/constants'

import logo from './source/images/logo.png' // eslint-disable-line no-unused-vars

require('./source/css/main.scss')
require('font-awesome/scss/font-awesome.scss')
require('./source/css/toast.scss')

let cartogramComputeRafId

let currentProjectId = null
let currentProjectName = null

let importing = false
const defaultGeography = 'United States'

if (typeof window !== 'undefined') {
  const mobileDetect = new MobileDetect(window.navigator.userAgent)
  const isMobile = mobileDetect.mobile()
  if (isMobile) {
    document.body.className = 'isMobile'
  }
}

function selectDataset(geography, index, customCsv) {
  const dataset = index !== null ?
    datasetResource.getDataset(geography, index) :
    datasetResource.buildDatasetFromCustomCsv(geography, customCsv)
  if (!dataset) {
    console.error('selectDataset: Dataset not found for', geography)
    return
  }
  importing = false
  ui.setSelectedDataset(dataset)
  canvas.computeCartogram(dataset)

  function iterateLoop() {
    const [iterated] = canvas.iterateCartogram(dataset.geography)
    if (iterated) {
      requestAnimationFrame(iterateLoop);
    } else {
      canvas.updateTilesFromMetrics()
    }
  }

  cancelAnimationFrame(cartogramComputeRafId)
  canvas.progress = 0
  cartogramComputeRafId = requestAnimationFrame(iterateLoop)
}

function updateUi() {
  ui.setTiles(canvas.getGrid().getTiles())
  ui.render()
}

function loadTopoJson(topoJson) {
  cancelAnimationFrame(cartogramComputeRafId)
  importing = true
  const { tiles, dataset, metricPerTile, geography } = importer.fromTopoJson(topoJson)
  ui.setGeography(geography)
  ui.setSelectedDataset(dataset)
  metrics.metricPerTile = metricPerTile
  canvas.setGeoCodeToName(geographyResource.getGeoCodeHash(geography))
  canvas.importTiles(tiles)
  updateUi()
  updateUi()
}

function loadProject(projectJson) {
  console.log('loadProject called with:', typeof projectJson, projectJson)
  cancelAnimationFrame(cartogramComputeRafId)
  importing = true
  try {
    console.log('About to call projectImporter.import with:', projectJson)
    const { tiles, dataset, metricPerTile, geography } = projectImporter.import(projectJson)
    console.log('Import successful, geography:', geography)
    ui.setGeography(geography)
    ui.setSelectedDataset(dataset)
    metrics.metricPerTile = metricPerTile
    canvas.setGeoCodeToName(geographyResource.getGeoCodeHash(geography))
    canvas.importTiles(tiles)
    updateUi()
  } catch (e) {
    console.error('loadProject error:', e)
    alert('Failed to load project file.')
  }
}

function selectGeography(geography) {
  /**
  * Updates ui with matching geo data (list of tilegrams, list of datasets).
  * Update ui and canvas with the matching geoCodeHash for the current geography. This is used
  * in the hexMetrics component and to render the labels on canvas.
  * Loads the first tilegram associated with the geography if it exists, else loads the first
  * dataset.
  * NB: ui.selectTilegramGenerateOption is loaded _after_ the dataset is updated to prevent error
  * on first load.
  */
  importing = false
  console.log('selectGeography called with:', geography)
  const datasets = datasetResource.getDatasetsByGeography(geography)
  const tilegrams = tilegramResource.getTilegramsByGeography(geography)
  const geoCodeToName = geographyResource.getGeoCodeHash(geography)
  ui.setGeography(geography)
  ui.setDatasetLabels(datasets.map(dataset => dataset.label))
  ui.setTilegramLabels(tilegrams.map(tilegram => tilegram.label))
  canvas.setGeoCodeToName(geoCodeToName)
  if (tilegrams.length) {
    loadTopoJson(tilegrams[0].topoJson)
    // ui.selectTilegram(0)
    ui.selectTilegramGenerateOption('import')
  } else {
    selectDataset(geography, 0)
    ui.selectTilegramGenerateOption('generate')
  }
}

function confirmNavigation(e) {
  // most browsers won't let you display custom text but have something like this anyway
  const message = '本当にこのページから離脱しますか？セーブされていない作業がすべて失われます。'
  e.returnValue = message
  return message
}

function init() {
  // wire up callbacks
  canvas.getGrid().onChange(() => updateUi())
  canvas.getGrid().setUiEditingCallback(() => ui.setEditingTrue())
  ui.setAddTileCallback(id => canvas.getGrid().onAddTileMouseDown(id))
  ui.setDatasetSelectedCallback((geography, index) => selectDataset(geography, index))
  ui.setTilegramSelectedCallback((geography, index) => {
    const tilegram = (tilegramResource.getTilegram(geography, index))
    if (tilegram) {
      loadTopoJson(tilegramResource.getTilegram(geography, index))
    }
  })
  ui.setCustomDatasetCallback((geography, csv) => selectDataset(geography, null, csv))
  ui.setHightlightCallback(id => canvas.getGrid().onHighlightGeo(id))
  ui.setUnhighlightCallback(() => canvas.getGrid().resetHighlightedGeo())
  ui.setResolutionChangedCallback((metricPerTile, sumMetrics) => {
    if (importing) {
      return
    }
    metrics.metricPerTile = metricPerTile
    metrics.sumMetrics = sumMetrics
    canvas.updateTilesFromMetrics()
  })
  ui.setUnsavedChangesCallback(() => canvas.getGrid().checkForEdits())
  ui.setResetUnsavedChangesCallback(() => canvas.getGrid().resetEdits())
  ui.setExportCallback(geography => {
    const json = exporter.toTopoJson(
      canvas.getGrid().getTiles(),
      ui.getSelectedDataset(),
      metrics.metricPerTile,
      geography
    )
    startDownload({
      filename: 'tiles.topo.json',
      mimeType: 'text/plain',
      content: JSON.stringify(json),
    })
  })
  ui.setExportSvgCallback(geography => {
    const svg = exporter.toSvg(
      canvas.getGrid().getTiles(),
      geography
    )
    startDownload({
      filename: 'tiles.svg',
      mimeType: 'image/svg+xml',
      content: svg,
    })
  })
  ui.setImportCallback(loadTopoJson)
  ui.setGeographySelectCallback(selectGeography)
  ui.setSaveProjectCallback(geography => {
    const json = projectExporter.export(
      canvas.getGrid().getTiles(),
      ui.getSelectedDataset(),
      metrics.metricPerTile,
      geography
    )
    startDownload({
      filename: 'tilegram-project.json',
      mimeType: 'application/json',
      content: json,
    })
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

// Configure Tool Header
customElements.whenDefined('dataviz-tool-header').then(() => {
  const configureHeader = () => {
    const header = document.querySelector('dataviz-tool-header')
    if (header) {
      installHeaderProcessingToasts(header)
      // Configure project management
      header.setProjectConfig({
        appName: 'tilegrams',
        onProjectLoad: (projectData) => {
          loadProject(projectData)
        },
        onProjectSave: (meta) => {
          currentProjectId = meta.id
          currentProjectName = meta.name
        },
      })

      header.setConfig({
        logo: {
          type: 'text',
          text: 'Tilegrams',
          textClass: 'font-bold text-lg text-white'
        },
        buttons: [
          {
            label: 'プロジェクトの保存',
            action: () => {
              showProcessingToast('保存準備中です')
              const geography = ui.getGeography()
              const jsonStr = projectExporter.export(
                canvas.getGrid().getTiles(),
                ui.getSelectedDataset(),
                metrics.metricPerTile,
                geography
              )
              const projectData = JSON.parse(jsonStr)
              const canvasEl = document.querySelector('#canvas canvas')
              const thumbnailDataUri = canvasEl ? canvasEl.toDataURL('image/png') : null
              header.showSaveModal({
                name: currentProjectName,
                data: projectData,
                thumbnailDataUri: thumbnailDataUri,
                existingProjectId: currentProjectId,
              })
            },
            align: 'right'
          },
          {
            label: 'プロジェクトの読込',
            action: () => {
              header.showLoadModal()
            },
            align: 'right'
          },
          {
            label: 'エクスポート',
            align: 'right',
            type: 'dropdown',
            items: [
              {
                label: 'TopoJSON',
                action: () => {
                  showProcessingToast('書き出し中です')
                  const geography = ui.getGeography()
                  const json = exporter.toTopoJson(
                    canvas.getGrid().getTiles(),
                    ui.getSelectedDataset(),
                    metrics.metricPerTile,
                    geography
                  )
                  startDownload({
                    filename: 'tiles.topo.json',
                    mimeType: 'text/plain',
                    content: JSON.stringify(json),
                  })
                }
              },
              {
                label: 'SVG',
                action: () => {
                  showProcessingToast('書き出し中です')
                  const geography = ui.getGeography()
                  const svg = exporter.toSvg(
                    canvas.getGrid().getTiles(),
                    geography
                  )
                  startDownload({
                    filename: 'tiles.svg',
                    mimeType: 'image/svg+xml',
                    content: svg,
                  })
                }
              },
              {
                label: 'PNG',
                action: () => {
                  showProcessingToast('書き出し中です')
                  ui._onExportPng()
                }
              }
            ]
          }

        ]
      })

      // Handle URL query parameter for auto-loading project
      const projectId = getQueryParam('project_id')
      if (projectId) {
        header.loadProject(projectId)
          .then(projectData => {
            loadProject(projectData)
          })
          .catch(err => {
            console.error('Cloud load failed', err)
          })
      }

      return true
    }
    return false
  }

  if (!configureHeader()) {
    const headerCheckInterval = setInterval(() => {
      if (configureHeader()) {
        clearInterval(headerCheckInterval)
      }
    }, 100)

    // Safety timeout after 10 seconds
    setTimeout(() => clearInterval(headerCheckInterval), 10000)
  }
})
