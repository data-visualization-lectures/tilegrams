import canvas from './Canvas'
import ui from './Ui'
import metrics from './Metrics'
import exporter from './file/Exporter'
import pngExporter from './file/PngExporter'
import projectExporter from './file/ProjectExporter'
import {startDownload} from './utils'
import {showErrorToast} from './ToolHeaderMessages'

function getCurrentTiles() {
  return canvas.getGrid().getTiles()
}

/** filename-safe slug from the geography's internal label, e.g. "japan" */
function geographySlug(geography) {
  const slug = (geography || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'tilegram'
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
    filename: `${geographySlug(geography)}-tilegram.topo.json`,
    mimeType: 'text/plain',
    content: JSON.stringify(buildTopoJson(geography)),
  })
}

export function exportSvg(geography) {
  startDownload({
    filename: `${geographySlug(geography)}-tilegram.svg`,
    mimeType: 'image/svg+xml',
    content: buildSvg(geography),
  })
}

export function exportPng() {
  if (!pngExporter.download()) {
    showErrorToast('画像生成に失敗しました')
  }
}

export function getCanvasThumbnailDataUri() {
  return pngExporter.toDataUrl()
}
