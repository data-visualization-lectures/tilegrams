import canvas from './Canvas'
import ui from './Ui'
import {
  loadTopoJson,
  selectCustomDataset,
  selectDataset,
  selectGeography,
  selectTilegram,
  updateResolution,
  updateUi,
} from './TilegramController'

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
  ui.setImportCallback(loadTopoJson)
  ui.setGeographySelectCallback(selectGeography)
}
