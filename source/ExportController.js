import canvas from './Canvas'
import ui from './Ui'
import metrics from './Metrics'
import exporter from './file/Exporter'
import pngExporter from './file/PngExporter'
import projectExporter from './file/ProjectExporter'
import {startDownload} from './utils'

function getCurrentTiles() {
  return canvas.getGrid().getTiles()
}

export function buildTopoJson(geography) {
  return exporter.toTopoJson(
    getCurrentTiles(),
    ui.getSelectedDataset(),
    metrics.metricPerTile,
    geography
  )
}

export function buildSvg(geography) {
  return exporter.toSvg(
    getCurrentTiles(),
    geography
  )
}

export function buildProjectJson(geography) {
  return projectExporter.export(
    getCurrentTiles(),
    ui.getSelectedDataset(),
    metrics.metricPerTile,
    geography
  )
}

export function exportTopoJson(geography) {
  startDownload({
    filename: 'tiles.topo.json',
    mimeType: 'text/plain',
    content: JSON.stringify(buildTopoJson(geography)),
  })
}

export function exportSvg(geography) {
  startDownload({
    filename: 'tiles.svg',
    mimeType: 'image/svg+xml',
    content: buildSvg(geography),
  })
}

export function exportProjectJson(geography) {
  startDownload({
    filename: 'tilegram-project.json',
    mimeType: 'application/json',
    content: buildProjectJson(geography),
  })
}

export function getCanvasThumbnailDataUri() {
  return pngExporter.toDataUrl()
}
