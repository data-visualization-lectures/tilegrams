import React from 'react'

import DatasetSelector from './DatasetSelector'
import ResolutionSlider from './ResolutionSlider'
import ImportControls from './ImportControls'

export default class TileGenerationUiControls extends React.Component {
  constructor(props) {
    super(props)

    this._changeOption = this._changeOption.bind(this)
    this._onCustomImport = this._onCustomImport.bind(this)
    this._onTilegramSelected = this._onTilegramSelected.bind(this)

    this._restoreLastTilegramSelection = null
  }

  _changeOption(value) {
    if (value === this.props.generateOption) {
      return
    }
    this.props.changeOption(value)
    if (value === 'import') {
      if (this._restoreLastTilegramSelection) {
        this._restoreLastTilegramSelection()
      } else {
        this.props.selectTilegram(0)
      }
    } else if (value === 'generate') {
      this.props.selectDataset(0)
    }
  }

  _onCustomImport(topoJson) {
    this._storeLastTilegramSelection(() => this.props.importCustom(topoJson))
  }

  _onTilegramSelected(index) {
    this._storeLastTilegramSelection(() => this.props.selectTilegram(index))
  }

  _storeLastTilegramSelection(restoreLastTilegramSelection) {
    this._restoreLastTilegramSelection = restoreLastTilegramSelection
    this._restoreLastTilegramSelection()
  }

  render() {
    const isImport = this.props.generateOption === 'import'
    return (
      <div className='ui-controls'>
        <div className='generate-tabs'>
          <button
            id='generate-tilegram'
            type='button'
            className={isImport ? 'generate-tab' : 'generate-tab active'}
            onClick={() => this._changeOption('generate')}
          >
            地図とデータから<br />新規作成
          </button>
          <button
            id='load-tilegram'
            type='button'
            className={isImport ? 'generate-tab active' : 'generate-tab'}
            onClick={() => this._changeOption('import')}
          >
            完成済み<br />タイルグラムを開く
          </button>
        </div>
        <div className={isImport ? 'generate-tab-panel collapsed' : 'generate-tab-panel'}>
          <DatasetSelector
            labels={this.props.datasetLabels}
            onDatasetSelected={index => this.props.selectDataset(index)}
            onCustomDataset={csv => this.props.selectCustomDataset(csv)}
            geography={this.props.geography}
          />
          <ResolutionSlider
            defaultResolution={this.props.defaultResolution}
            metricDomain={this.props.metricDomain}
            onChange={value => this.props.changeResolution(value, this.props.datasetSum)}
          />
        </div>
        <div className={isImport ? 'generate-tab-panel' : 'generate-tab-panel collapsed'}>
          <ImportControls
            labels={this.props.tilegramLabels}
            onCustomImport={this._onCustomImport}
            onTilegramSelected={this._onTilegramSelected}
            metricPerTile={this.props.metricPerTile}
          />
        </div>
      </div>
    )
  }
}

TileGenerationUiControls.propTypes = {
  datasetLabels: React.PropTypes.array,
  tilegramLabels: React.PropTypes.array,
  selectDataset: React.PropTypes.func,
  selectTilegram: React.PropTypes.func,
  changeOption: React.PropTypes.func,
  generateOption: React.PropTypes.string,
  selectCustomDataset: React.PropTypes.func,
  importCustom: React.PropTypes.func,
  changeResolution: React.PropTypes.func,
  datasetSum: React.PropTypes.number,
  metricDomain: React.PropTypes.array,
  defaultResolution: React.PropTypes.number,
  metricPerTile: React.PropTypes.number,
  editing: React.PropTypes.bool,
  generateOpen: React.PropTypes.bool,
  editOpen: React.PropTypes.bool,
  geography: React.PropTypes.string,
}

TileGenerationUiControls.defaultProps = {
  datasetLabels: [],
  tilegramLabels: [],
  selectDataset: () => {},
  selectTilegram: () => {},
  changeOption: () => {},
  selectCustomDataset: () => {},
  importCustom: () => {},
  changeResolution: () => {},
  metricPerTile: 1,
  editing: false,
  generateOption: 'import',
}
