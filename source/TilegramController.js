import canvas from './Canvas'
import ui from './Ui'
import metrics from './Metrics'
import importer from './file/Importer'
import projectImporter from './file/ProjectImporter'
import datasetResource from './resources/DatasetResource'
import geographyResource from './resources/GeographyResource'
import tilegramResource from './resources/TilegramResource'
import {showErrorToast} from './ToolHeaderMessages'
import strings from './strings'

let cartogramComputeRafId
let importing = false
let cartogramComputing = false
// the cartogram shapes are in canvas pixels; after a resize they must be recomputed
let cartogramStale = false
let currentDataset = null

export function updateUi() {
  ui.setTiles(canvas.getGrid().getTiles())
  ui.render()
}

function applyImportedTilegramState(importedState) {
  const {tiles, dataset, metricPerTile, geography} = importedState
  ui.setGeography(geography)
  ui.setSelectedDataset(dataset)
  metrics.metricPerTile = metricPerTile
  canvas.setGeoCodeToName(geographyResource.getGeoCodeHash(geography))
  canvas.importTiles(tiles)
  updateUi()
}

function loadImportedTilegramState(readImportedState) {
  cancelAnimationFrame(cartogramComputeRafId)
  cartogramComputing = false
  importing = true
  applyImportedTilegramState(readImportedState())
}

export function loadTopoJson(topoJson) {
  loadImportedTilegramState(() => importer.fromTopoJson(topoJson))
}

export function loadProject(projectJson) {
  try {
    loadImportedTilegramState(() => projectImporter.import(projectJson))
  } catch (e) {
    console.error('loadProject error:', e)
    showErrorToast(strings.messages.projectLoadFailed)
  }
}

export function selectDataset(geography, index, customCsv) {
  const dataset = index !== null ?
    datasetResource.getDataset(geography, index) :
    datasetResource.buildDatasetFromCustomCsv(geography, customCsv)
  if (!dataset) {
    console.error('selectDataset: Dataset not found for', geography)
    return
  }
  importing = false
  ui.setSelectedDataset(dataset)
  computeCartogram(dataset)
}

function computeCartogram(dataset) {
  currentDataset = dataset
  cartogramStale = false
  cartogramComputing = true
  canvas.computeCartogram(dataset)

  const iterateLoop = () => {
    const [iterated] = canvas.iterateCartogram(dataset.geography)
    if (iterated) {
      cartogramComputeRafId = requestAnimationFrame(iterateLoop)
    } else {
      cartogramComputing = false
      canvas.updateTilesFromMetrics()
    }
  }

  cancelAnimationFrame(cartogramComputeRafId)
  canvas.progress = 0
  cartogramComputeRafId = requestAnimationFrame(iterateLoop)
}

/** call after the canvas has been resized and the grid rescaled */
export function handleCanvasResize() {
  if (importing || !currentDataset) {
    return
  }
  if (cartogramComputing) {
    // restart so the cartogram is computed in the new canvas size
    computeCartogram(currentDataset)
  } else {
    cartogramStale = true
  }
}

export function selectCustomDataset(geography, csv) {
  selectDataset(geography, null, csv)
}

export function selectTilegram(geography, index) {
  const tilegram = tilegramResource.getTilegram(geography, index)
  if (tilegram) {
    loadTopoJson(tilegram)
  }
}

export function updateResolution(metricPerTile, sumMetrics) {
  if (importing) {
    return
  }
  metrics.metricPerTile = metricPerTile
  metrics.sumMetrics = sumMetrics
  if (cartogramStale) {
    computeCartogram(currentDataset)
    return
  }
  canvas.updateTilesFromMetrics()
}

export function selectGeography(geography) {
  /**
  * Updates ui with matching geo data (list of tilegrams, list of datasets).
  * Update ui and canvas with the matching geoCodeHash for the current geography. This is used
  * in the hexMetrics component and to render the labels on canvas.
  * Generates a tilegram from the first dataset associated with the geography if it exists,
  * else loads the first premade tilegram.
  * NB: ui.selectTilegramGenerateOption is loaded _after_ the dataset is updated to prevent error
  * on first load.
  */
  importing = false
  const datasets = datasetResource.getDatasetsByGeography(geography)
  const tilegrams = tilegramResource.getTilegramsByGeography(geography)
  const geoCodeToName = geographyResource.getGeoCodeHash(geography)
  ui.setGeography(geography)
  ui.setDatasetLabels(datasets.map(dataset => dataset.label))
  ui.setTilegramLabels(tilegrams.map(tilegram => tilegram.label))
  canvas.setGeoCodeToName(geoCodeToName)
  if (datasets.length) {
    selectDataset(geography, 0)
    ui.selectTilegramGenerateOption('generate')
  } else if (tilegrams.length) {
    loadTopoJson(tilegrams[0].topoJson)
    ui.selectTilegramGenerateOption('import')
  }
}
