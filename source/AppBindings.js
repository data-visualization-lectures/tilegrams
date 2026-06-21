import canvas from './Canvas'
import ui from './Ui'
import {
  loadProject,
  loadTopoJson,
  selectCustomDataset,
  selectDataset,
  selectGeography,
  selectTilegram,
  updateResolution,
  updateUi,
} from './TilegramController'
import {
  exportProjectJson,
  exportSvg,
  exportTopoJson,
} from './ExportController'

export default function installAppBindings() {
  canvas.getGrid().onChange(() => updateUi())
  canvas.getGrid().setUiEditingCallback(() => ui.setEditingTrue())
  ui.setAddTileCallback(id => canvas.getGrid().onAddTileMouseDown(id))
  ui.setDatasetSelectedCallback(selectDataset)
  ui.setTilegramSelectedCallback(selectTilegram)
  ui.setCustomDatasetCallback(selectCustomDataset)
  ui.setHighlightCallback(id => canvas.getGrid().onHighlightGeo(id))
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
}
