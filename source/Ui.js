import React from 'react'
import ReactDOM from 'react-dom'
import ReactMarkdown from 'react-markdown'

import manual from 'raw!../MANUAL.md'

import metrics from './Metrics'
import { createElement } from './utils'
import { nTileDomain } from './constants'
import TileGenerationUiControls from './components/TileGenerationUiControls'
import HexMetrics from './components/HexMetrics'
import ExportButton from './components/ExportButton'
import EditWarningModal from './components/EditWarningModal'
import CloudSaveModal from './components/CloudSaveModal'
import CloudLoadModal from './components/CloudLoadModal'
import Tooltip from './components/Tooltip'
import Toast from './components/Toast'
import googleNewsLabLogo from './images/gnl-logo.png'
import tilegramsLogo from './images/tilegrams-logo.svg'
import GeographySelector from './components/GeographySelector'
import geographyResource from './resources/GeographyResource'
import projectExporter from './file/ProjectExporter'
import cloudApi from './utils/CloudApi'

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
    this._showCloudSave = false
    this._showCloudLoad = false
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

    this._openCloudSave = this._openCloudSave.bind(this)
    this._closeCloudModal = this._closeCloudModal.bind(this)
    this._onSaveToCloud = this._onSaveToCloud.bind(this)
    this._openCloudLoad = this._openCloudLoad.bind(this)
    this._onLoadFromCloud = this._onLoadFromCloud.bind(this)
    this._onExportPng = this._onExportPng.bind(this)
  }

  _onExportPng() {
    const dataUrl = this._getThumbnailDataUrl()
    if (dataUrl) {
      const link = document.createElement('a')
      link.setAttribute('download', 'tilegram.png')
      link.setAttribute('href', dataUrl)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
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

  setHightlightCallback(callback) {
    this._highlightCallback = callback
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
      const reader = new FileReader()
      reader.onload = readEvent => {
        callback(readEvent.target.result)
      }
      reader.readAsText(file)
      event.target.value = ''
    }
  }

  setLoadProjectFromCloudCallback(callback) {
    this._loadProjectFromCloudCallback = callback
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
    this._container = createElement({ id: 'ui' })
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

  _openCloudSave() {
    this._showCloudSave = true
    this.render()
  }

  _openCloudLoad() {
    this._showCloudLoad = true
    this.render()
  }

  _closeCloudModal() {
    this._showCloudSave = false
    this._showCloudLoad = false
    this.render()
  }

  _getThumbnailDataUrl() {
    const canvas = document.querySelector('#canvas canvas')
    if (canvas) {
      return canvas.toDataURL('image/png')
    }
    return null
  }

  _onSaveToCloud(name) {
    const jsonStr = projectExporter.export(
      this._tiles,
      this._selectedDataset,
      metrics.metricPerTile,
      this._selectedGeography
    )
    const projectData = JSON.parse(jsonStr)
    const thumbnail = this._getThumbnailDataUrl()

    return cloudApi.saveProject(name, projectData, thumbnail)
      .then(() => {
        this._showToast('保存しました！', 'success')
        this._closeCloudModal()
      })
      .catch(err => {
        this._showToast('保存に失敗しました: ' + err.message, 'error')
        throw err // Re-throw to let modal know it failed
      })
  }

  _onLoadFromCloud(projectId) {
    console.log('_onLoadFromCloud called with projectId:', projectId)
    cloudApi.loadProject(projectId)
      .then(data => {
        console.log('cloudApi.loadProject returned:', typeof data, data)
        console.log('About to call _loadProjectFromCloudCallback')
        // API returns the project JSON directly as the response body
        this._loadProjectFromCloudCallback(data)
        this._closeCloudModal()
      })
      .catch(err => {
        console.error('Cloud load error:', err)
        this._showToast('読み込みに失敗しました: ' + err.message, 'error')
      })
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
      <div
        className={this._generateOpen ? 'step' : 'active step'}
        onClick={this._toggle('generate')}
      >
        <span>生成する</span>
        <span className='arrow' />
      </div>
    )
    let errorWarning = null
    if (this._nErrors > 0) {
      const objectId = geographyResource.getMapResource(this._selectedGeography).getObjectId()
      errorWarning = (
        <span
          className='n-errors'
          onMouseOver={this._toggleRefineTooltip}
          onMouseOut={this._toggleRefineTooltip}
        >
          <i className='fa fa-exclamation-triangle' /> {this._nErrors} {objectId}
        </span>
      )
    }
    const editOption = (
      <div
        className={this._editOpen ? 'step' : 'active step'}
        onClick={this._toggle('edit')}
      >
        <span>洗練させる</span>
        {errorWarning}
        <span className='arrow' />
      </div>
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
    const manualClass = this._manualOpen ? 'manual' : 'manual hidden'

    let cloudModal = null
    if (this._showCloudSave) {
      cloudModal = (
        <CloudSaveModal
          onSave={this._onSaveToCloud}
          onCancel={this._closeCloudModal}
        />
      )
    } else if (this._showCloudLoad) {
      cloudModal = (
        <CloudLoadModal
          onLoad={this._onLoadFromCloud}
          onCancel={this._closeCloudModal}
        />
      )
    }

    const selectedTilegram = this._tilegramLabels[this._selectedTilegramIndex]
    let congressionalDistrictModal = null
    if (
      selectedTilegram &&
      this._generateOption === 'import' &&
      selectedTilegram.includes('U.S. Congressional Districts 2018')
    ) {
      congressionalDistrictModal = (
        <div className='congressionalDistrictModal'>
          Looking for each State broken out individually?
          Don't worry,
          <a
            href='./us-congressional-districts-2018.html'
            target='_blank'
            rel='noopener noreferrer'
          >
            we have you covered.
          </a>
        </div>
      )
    }
    if (selectedTilegram && selectedTilegram.includes('India')) {
      congressionalDistrictModal = (
        <div className='congressionalDistrictModal india'>
          このデータビジュアライゼーションは、インドの伝統的な地図をもとにした地図表現であり、地理的な正確性が100%保証されているわけではありません。
        </div>
      )
    }
    ReactDOM.render(
      <div>
        {modal}
        {cloudModal}
        {congressionalDistrictModal}
        <div className={manualClass}>
          <div
            className='manual-close'
            onClick={this._toggleManual}
          >
            <i className='fa fa-times' />
          </div>
          <ReactMarkdown source={manual} />
        </div>
        <div className='mobile-redirect'>
          <div className='background'>
            <div className='main'>
              <div
                className='close-mobile'
                onClick={this._closeMobile}
              >&#215;</div>
              <h1>TILEGRAMS</h1>
              <img src={tilegramsLogo} className='tilegrams-logo' alt='Tilegrams' />
              <h2>データセットに比例して地域の大きさを調整したタイル地図を作成しましょう。</h2>
              <h3>最適な体験のためには、ノートパソコンまたはデスクトップコンピューターでご利用ください。</h3>
            </div>
          </div>
        </div>

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
              style={{ height: uiControlsHeight, overflow: 'hidden' }}
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
            style={{ height: metricsHeight, overflow: 'hidden' }}
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
          <div className='download' style={{ display: 'none' }}>
            <div className='step'>
              <span>ダウンロード</span>
            </div>
            <div className='instruction'>
              {`作成したタイルグラムを活用するには、以下の標準的な形式のいずれかでダウンロードしてご利用ください。`}
            </div>
            <fieldset>
              <ExportButton
                text='TopoJSON'
                onClick={() => this._exportCallback()}
              />
              <ExportButton
                text='Export SVG'
                onClick={this._exportSvgCallback}
              />
              <ExportButton
                text='Export PNG'
                onClick={this._onExportPng}
              />
            </fieldset>
          </div>
          <hr />
          <div className='project-management' style={{ display: 'none' }}>
            <div>
              <div className='step'>
                <span>プロジェクト</span>
              </div>
              <fieldset>
                <button
                  className='button'
                  style={{ display: 'block', marginBottom: '10px' }}
                  onClick={() => this._saveProjectCallback(this._selectedGeography)}
                >
                  プロジェクトの保存
                </button>
                <div
                  className='button'
                  style={{ position: 'relative', display: 'block' }}
                >
                  プロジェクトの読込
                  <input
                    type='file'
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      opacity: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                    onChange={this._loadProjectCallback}
                  />
                </div>
              </fieldset>
            </div>

            <div style={{ display: 'none' }}>
              <div className='step'>
                <span>サーバへ保存</span>
              </div>
              <fieldset>
                <button
                  className='button'
                  style={{ display: 'block', marginBottom: '10px' }}
                  onClick={this._openCloudSave}
                >
                  サーバへ保存
                </button>
                <button
                  className='button'
                  style={{ display: 'block' }}
                  onClick={this._openCloudLoad}
                >
                  サーバからの読込
                </button>
              </fieldset>
            </div>
          </div>
        </div>
        <h2 className='credits'>
          A project by
          <a
            href='http://pitchinteractive.com/'
            target='_blank'
            rel='noopener noreferrer'
          >
            Pitch Interactive
          </a>
          in association with
          <a
            href='https://newslab.withgoogle.com/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <img src={googleNewsLabLogo} className='gnl-logo' alt='Google News Lab' />
          </a>
        </h2>
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
