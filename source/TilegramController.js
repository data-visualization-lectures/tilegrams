import canvas from './Canvas'
import ui from './Ui'
import metrics from './Metrics'
import importer from './file/Importer'
import projectImporter from './file/ProjectImporter'
import datasetResource from './resources/DatasetResource'
import geographyResource from './resources/GeographyResource'
import tilegramResource from './resources/TilegramResource'

let cartogramComputeRafId
let importing = false

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

export function loadTopoJson(topoJson) {
  cancelAnimationFrame(cartogramComputeRafId)
  importing = true
  applyImportedTilegramState(importer.fromTopoJson(topoJson))
}

export function loadProject(projectJson) {
  console.log('loadProject called with:', typeof projectJson, projectJson)
  cancelAnimationFrame(cartogramComputeRafId)
  importing = true
  try {
    console.log('About to call projectImporter.import with:', projectJson)
    const importedState = projectImporter.import(projectJson)
    console.log('Import successful, geography:', importedState.geography)
    applyImportedTilegramState(importedState)
  } catch (e) {
    console.error('loadProject error:', e)
    alert('Failed to load project file.')
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
  canvas.computeCartogram(dataset)

  const iterateLoop = () => {
    const [iterated] = canvas.iterateCartogram(dataset.geography)
    if (iterated) {
      requestAnimationFrame(iterateLoop)
    } else {
      canvas.updateTilesFromMetrics()
    }
  }

  cancelAnimationFrame(cartogramComputeRafId)
  canvas.progress = 0
  cartogramComputeRafId = requestAnimationFrame(iterateLoop)
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
  canvas.updateTilesFromMetrics()
}

export function selectGeography(geography) {
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
