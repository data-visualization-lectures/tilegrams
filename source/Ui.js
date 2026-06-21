import React from 'react'
import ReactDOM from 'react-dom'
import ReactMarkdown from 'react-markdown'

import manual from 'raw!../MANUAL.md'

import metrics from './Metrics'
import {createElement} from './utils'
import {showProcessingToast} from './ToolHeaderMessages'
import {nTileDomain} from './constants'
import TileGenerationUiControls from './components/TileGenerationUiControls'
import HexMetrics from './components/HexMetrics'
import EditWarningModal from './components/EditWarningModal'
import Tooltip from './components/Tooltip'
import Toast from './components/Toast'
import Credits from './components/Credits'
import ManualPanel from './components/ManualPanel'
import MobileRedirect from './components/MobileRedirect'
import TilegramNotice from './components/TilegramNotice'
import StepHeader from './components/StepHeader'
import RefineErrorWarning from './components/RefineErrorWarning'
import pngExporter from './file/PngExporter'
import googleNewsLabLogo from './images/gnl-logo.png'
import tilegramsLogo from './images/tilegrams-logo.svg'
import GeographySelector from './components/GeographySelector'

class Ui {
  constructor() {
    this._init()
    this._tiles = null
    this._selectedGeography = null
    this._editing = false
    this._generateOpen = true
    this._editOpen = false
    this._manualOpen = false
    this._nErrors = 0
    this._hideRefineTooltip = true
    this._mouseY = 0
    this._toastMessage = ''
    this._toastVisible = false
    this._toastType = 'info'

    this._startOver = this._startOver.bind(this)
    this._resumeEditing = this._resumeEditing.bind(this)
    this._checkForEdits = this._checkForEdits.bind(this)
    this._toggleManual = this._toggleManual.bind(this)
    this._updateNErrors = this._updateNErrors.bind(this)
    this._toggleRefineTooltip = this._toggleRefineTooltip.bind(this)
    this._closeMobile = this._closeMobile.bind(this)
    this.selectTilegramGenerateOption = this.selectTilegramGenerateOption.bind(this)
    this._selectedTilegramIndex = 0;

    this.exportPng = this.exportPng.bind(this)
  }

  exportPng() {
    if (!pngExporter.download()) {
      this._showToast('画像生成に失敗しました', 'error')
    }
  }

  _showToast(message, type = 'info') {
    this._toastMessage = message
    this._toastType = type
    this._toastVisible = true
    this.render()
    setTimeout(() => {
      this._toastVisible = false
      this.render()
    }, 3000)
  }

  _closeMobile() {
    document.body.className = ''
  }

  setTiles(tiles) {
    this._tiles = tiles
  }

  setAddTileCallback(callback) {
    this._addTileCallback = callback
  }

  setDatasetLabels(datasetLabels) {
    this._datasetLabels = datasetLabels
  }

  setTilegramLabels(tilegramLabels) {
    this._tilegramLabels = tilegramLabels
    this._selectedTilegramIndex = 0
  }

  setSelectedDataset(dataset) {
    this._selectedDataset = dataset.data
    this._selectedDatasetSum = this.getDatasetSum(this._selectedDataset)
    this._metricDomain = this._calculateIdealDomain()
    this._defaultResolution = dataset.defaultResolution
  }

  getSelectedDataset() {
    return this._selectedDataset
  }

  setGeography(geography) {
    this._selectedGeography = geography
  }

  getGeography() {
    return this._selectedGeography
  }

  selectTilegramGenerateOption(tilegramGenerateOption) {
    this._generateOption = tilegramGenerateOption
    this.render()
  }

  /** calculate the slider's domain from the dataset */
  _calculateIdealDomain() {
    const metricMin = this.roundToPretty(this._selectedDatasetSum / nTileDomain[0])
    const metricMax = this.roundToPretty(this._selectedDatasetSum / nTileDomain[1])
    return [metricMax, metricMin]
  }

  /** round to two significant digits rounded to nearest multiple of 5 */
  roundToPretty(number) {
    const units = Math.pow(10, Math.floor(Math.log10(number)) - 1)
    const significant = number / units
    const rounded = 5 * (Math.round(significant / 5))
    return rounded * units
  }

  getDatasetSum(dataset) {
    return dataset.reduce((a, b) => { return a + b[1] }, 0)
  }

  setDatasetSelectedCallback(callback) {
    this._datasetSelectedCallback = (index) => {
      callback(this._selectedGeography, index)
    }
  }

  setTilegramSelectedCallback(callback) {
    this._tilegramSelectedCallback = (index) => {
      this._selectedTilegramIndex = index;
      callback(this._selectedGeography, index)
    }
  }

  setCustomDatasetCallback(callback) {
    this._customDatasetCallback = (csv) => {
      callback(this._selectedGeography, csv)
    }
  }

  setHighlightCallback(callback) {
    this._highlightCallback = callback
  }

  setHightlightCallback(callback) {
    this.setHighlightCallback(callback)
  }

  setUnhighlightCallback(callback) {
    this._unhighlightCallback = callback
  }

  setResolutionChangedCallback(callback) {
    this._resolutionChangedCallback = callback
  }

  setExportCallback(callback) {
    this._exportCallback = () => {
      callback(this._selectedGeography)
    }
  }

  setExportSvgCallback(callback) {
    this._exportSvgCallback = () => {
      callback(this._selectedGeography)
    }
  }

  setImportCallback(callback) {
    this._importCallback = (topoJson) => {
      callback(topoJson)
    }
  }

  setGeographySelectCallback(callback) {
    this._selectGeographyCallback = (geography) => {
      callback(geography)
    }
  }

  setSaveProjectCallback(callback) {
    this._saveProjectCallback = (geography) => {
      callback(geography)
    }
  }

  setLoadProjectCallback(callback) {
    this._loadProjectCallback = (event) => {
      const file = event.target.files[0]
      if (!file) return
      showProcessingToast('ファイルを読み込み中です')
      const reader = new FileReader()
      reader.onload = readEvent => {
        callback(readEvent.target.result)
      }
      reader.readAsText(file)
      event.target.value = ''
    }
  }

  _checkForEdits(event) {
    if (this._checkForUnsavedChanges()) {
      event.preventDefault()
      event.stopPropagation()
      this._showModal = true
      this.render()
      return
    }
    this._editing = false
    this.render()
    // to allow CSS to paint
    window.requestAnimationFrame(this.render.bind(this))
  }

  setUnsavedChangesCallback(callback) {
    this._checkForUnsavedChanges = callback
  }

  setResetUnsavedChangesCallback(callback) {
    this._resetUnsavedChanges = callback
  }

  _init() {
    this._container = createElement({id: 'ui'})
  }

  _startOver() {
    this._editing = false
    this._showModal = false
    this._resetUnsavedChanges()
    this.render()
  }

  _resumeEditing() {
    this._showModal = false
    this.render()
  }

  setEditingTrue() {
    this._editing = true
    this.render()
  }

  _toggle(toggleOpt) {
    return () => {
      if (toggleOpt === 'generate') {
        this._generateOpen = !this._generateOpen
      } else if (toggleOpt === 'edit') {
        this._editOpen = !this._editOpen
      }
      this.render()
    }
  }

  _toggleManual() {
    this._manualOpen = !this._manualOpen
    this.render()
  }

  _updateNErrors(value) {
    if (this._nErrors !== value) {
      this._nErrors = value
      this.render()
    }
  }

  _toggleRefineTooltip(event) {
    this._hideRefineTooltip = !this._hideRefineTooltip
    if (!this._hideRefineTooltip) {
      this._mouseY = event.clientY
    }
    this.render()
  }

  render() {
    const tileGenerationControls = (
      <TileGenerationUiControls
        datasetLabels={this._datasetLabels}
        tilegramLabels={this._tilegramLabels}
        changeOption={this.selectTilegramGenerateOption}
        selectDataset={this._datasetSelectedCallback}
        selectTilegram={this._tilegramSelectedCallback}
        selectCustomDataset={this._customDatasetCallback}
        importCustom={this._importCallback}
        metricDomain={this._metricDomain}
        defaultResolution={this._defaultResolution}
        metricPerTile={metrics.metricPerTile}
        changeResolution={this._resolutionChangedCallback}
        datasetSum={this._selectedDatasetSum}
        editing={this._editing}
        generateOption={this._generateOption}
        geography={this._selectedGeography}
      />
    )
    const generateOption = (
      <StepHeader
        open={this._generateOpen}
        label='生成する'
        onClick={this._toggle('generate')}
      />
    )
    const errorWarning = (
      <RefineErrorWarning
        geography={this._selectedGeography}
        nErrors={this._nErrors}
        onMouseOver={this._toggleRefineTooltip}
        onMouseOut={this._toggleRefineTooltip}
      />
    )
    const editOption = (
      <StepHeader
        open={this._editOpen}
        label='洗練させる'
        onClick={this._toggle('edit')}
      >
        {errorWarning}
      </StepHeader>
    )
    let modal = null
    if (this._showModal) {
      modal = (
        <EditWarningModal
          startOver={this._startOver}
          resumeEditing={this._resumeEditing}
        />
      )
    }
    const uiControlsHeight = this._generateOpen ? 'auto' : '0px'
    const metricsHeight = this._editOpen ? 'auto' : '0px'

    const selectedTilegram = this._tilegramLabels[this._selectedTilegramIndex]
    ReactDOM.render(
      <div>
        {modal}
        <TilegramNotice
          selectedTilegram={selectedTilegram}
          generateOption={this._generateOption}
        />
        <ManualPanel
          open={this._manualOpen}
          onClose={this._toggleManual}
          source={manual}
          markdownComponent={ReactMarkdown}
        />
        <MobileRedirect
          onClose={this._closeMobile}
          tilegramsLogo={tilegramsLogo}
        />

        <div className='column'>
          <div>
            <p className='intro'>
              データセットに比例して地域の大きさを調整したタイル地図を作成しましょう。
              <br />
              <br />
              詳しい情報や手順については
              <a
                onClick={this._toggleManual}
                target='_blank'
                rel='noopener noreferrer'
              > マニュアル</a>をご覧ください。
            </p>
            <hr />
            {generateOption}
            <div
              className={this._editing ? 'deselected' : ''}
              style={{height: uiControlsHeight, overflow: 'hidden'}}
              onMouseDown={this._checkForEdits}
            >
              <GeographySelector
                selectedGeography={this._selectedGeography}
                selectGeography={this._selectGeographyCallback}
              />
              {tileGenerationControls}
            </div>
            <hr />
            {editOption}
          </div>
          <div
            className={this._editing ? '' : 'deselected'}
            style={{height: metricsHeight, overflow: 'hidden'}}
          >
            <HexMetrics
              metricPerTile={metrics.metricPerTile}
              dataset={this._selectedDataset}
              geography={this._selectedGeography}
              tiles={this._tiles}
              onAddTileMouseDown={this._addTileCallback}
              onMetricMouseOver={this._highlightCallback}
              onMetricMouseOut={this._unhighlightCallback}
              updateNErrors={this._updateNErrors}
            />
          </div>
          <hr />
        </div>
        <Credits googleNewsLabLogo={googleNewsLabLogo} />
        <Tooltip
          hidden={this._hideRefineTooltip}
          text='Some areas require additional manual adjustment to be statistically accurate.'
          yPos={this._mouseY}
        />
        <Toast
          message={this._toastMessage}
          visible={this._toastVisible}
          type={this._toastType}
        />
      </div>,
      this._container
    )
  }
}

export default new Ui()
