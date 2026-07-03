import {csvParseRows} from 'd3-dsv'
import geographyResource from './GeographyResource.js'
import {showWarningToast} from '../ToolHeaderMessages'
import populationCsv from '../../data/us/population-by-state.csv'
import electoralCollegeCsv from '../../data/us/electoral-college-votes-by-state.csv'
import gdpCsv from '../../data/us/gdp-by-state.csv'
import congressionalDistricts2018 from '../../data/us/congressional-districts-2018.csv'
// import ukConstituency from '../../data/uk/constituencies.csv'
// import ukAuthority from '../../data/uk/authorities.csv'
import germanyConstituency from '../../data/germany/constituencies.csv'
import franceRegionPopulation from '../../data/france/region-population.csv'
import franceDepartment from '../../data/france/departments.csv'
import netherlandsPopulation from '../../data/netherlands/netherlands-populations.csv'
import brazilPopulation2018 from '../../data/brazil/brazil-populations.csv'
import irelandVotes from '../../data/ireland/constituency_values.csv'
import ukRegionConstituencyCounts from '../../data/uk/uk_region_constituency_counts.csv'
import indiaContituencyCounts from '../../data/india/india_constituency_counts.csv';
import japanPrefecturesVariables from '../../data/japan/prefectures.csv';
import japanPopulationCsv from '../../data/japan/population.csv';
import tokyoWardsVariables from '../../data/japan/tokyo-wards.csv';

class DatasetResource {
  constructor() {
    /**
    * Datasets must have an associated geography for the map graphic to successfully compute a
    * cartogram. Default resolution (optional) is the default tile value when a user selects the
    * data from the dropdown.
    */
    this._datasets = [
      {
        label: '日本の人口（2020年国勢調査）',
        data: this.parseCsv(japanPopulationCsv, 'Japan'),
        geography: 'Japan',
        defaultResolution: 500000,
      },
      {
        label: '都道府県 1対1',
        data: this.parseCsv(japanPrefecturesVariables, 'Japan'),
        geography: 'Japan',
        defaultResolution: 1,
      },
      {
        label: '東京都 市区町村 1対1（島しょ部を除く）',
        data: this.parseCsv(tokyoWardsVariables, 'Tokyo'),
        geography: 'Tokyo',
        defaultResolution: 1,
      },
      {
        label: 'アメリカの人口（2016年）',
        data: this.parseCsv(populationCsv, 'United States'),
        geography: 'United States',
        defaultResolution: 1000000,
      },
      {
        label: 'アメリカ大統領選挙人（2016年）',
        data: this.parseCsv(electoralCollegeCsv, 'United States'),
        geography: 'United States',
        defaultResolution: 1,
      },
      {
        label: 'アメリカ州別GDP（2015年・百万ドル）',
        data: this.parseCsv(gdpCsv, 'United States'),
        geography: 'United States',
      },
      {
        label: 'アメリカ連邦下院選挙区（2018年）',
        data: this.parseCsv(congressionalDistricts2018, 'United States'),
        geography: 'United States',
        defaultResolution: 1,
      },
      {
        label: 'オランダの人口',
        data: this.parseCsv(netherlandsPopulation, 'Netherlands'),
        geography: 'Netherlands',
        defaultResolution: 50000,
      },
      {
        label: 'ブラジルの人口（2017年）',
        data: this.parseCsv(brazilPopulation2018, 'Brazil'),
        geography: 'Brazil',
        defaultResolution: 500000,
      },
      // {
      //   label: 'U.K. Constituency 1-to-1',
      //   data: this.parseCsv(ukConstituency, 'United Kingdom - Constituencies'),
      //   geography: 'United Kingdom - Constituencies',
      //   defaultResolution: 1,
      // },
      // {
      //   label: 'U.K. Authority 1-to-1',
      //   data: this.parseCsv(ukAuthority, 'United Kingdom - Local Authorities'),
      //   geography: 'United Kingdom - Local Authorities',
      //   defaultResolution: 1,
      // },
      {
        label: 'ドイツ連邦議会選挙区 1対1',
        data: this.parseCsv(germanyConstituency, 'Germany - Constituencies'),
        geography: 'Germany - Constituencies',
        defaultResolution: 1,
      },
      {
        label: 'フランス地域圏の人口',
        data: this.parseCsv(franceRegionPopulation, 'France - Regions'),
        geography: 'France - Regions',
        defaultResolution: 100000,
      },
      {
        label: 'フランス県 1対1',
        data: this.parseCsv(franceDepartment, 'France - Departments'),
        geography: 'France - Departments',
        defaultResolution: 1,
      },
      {
        label: 'アイルランド選挙区',
        data: this.parseCsv(irelandVotes, 'Ireland'),
        geography: 'Ireland',
        defaultResolution: 1,
      },
      {
        label: 'イギリス地域（選挙区数）',
        data: this.parseCsv(ukRegionConstituencyCounts, 'United Kingdom - Regions'),
        geography: 'United Kingdom - Regions',
        defaultResolution: 1,
      },
      {
        label: 'インド選挙区',
        data: this.parseCsv(indiaContituencyCounts, 'India'),
        geography: 'India',
        defaultResolution: 1,
      },
    ]
  }

  _validateFips(fips) {
    return fips && fips.length < 2 ? `0${fips}` : fips
  }

  /** trim, strip quotes, and convert full-width digits/commas to half-width */
  _normalizeJapaneseCell(value) {
    if (value == null) { return '' }
    return String(value)
      .trim()
      .replace(/^["']+|["']+$/g, '')
      .replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
      .replace(/，/g, ',')
      .trim()
  }

  /** parse numbers that may contain thousands separators or full-width digits */
  _parseJapaneseNumber(value) {
    const normalized = this._normalizeJapaneseCell(value).replace(/,/g, '')
    if (normalized === '') { return NaN }
    return parseFloat(normalized)
  }

  /**
  * Resolve a geo id for Japanese maps. Accepts numeric codes (1, 01, 131016),
  * ISO 3166-2 codes (JP-13), and names from the geo dictionary (東京都 / 東京).
  * Returns the normalized input string when unresolvable so validation can
  * report it back to the user.
  */
  _resolveJapaneseGeoCode(geography, rawId) {
    const id = this._normalizeJapaneseCell(rawId)
    const isoMatch = id.match(/^JP-?0*(\d+)$/i)
    if (isoMatch) { return parseInt(isoMatch[1], 10) }
    if (/^\d+$/.test(id)) { return parseInt(id, 10) }
    this._nameToGeoCode = this._nameToGeoCode || {}
    if (!this._nameToGeoCode[geography]) {
      const hash = geographyResource.getGeoCodeHash(geography)
      const lookup = {}
      Object.keys(hash).forEach(code => {
        const entry = hash[code]
        const numericCode = parseInt(code, 10)
        if (entry.name) { lookup[entry.name] = numericCode }
        if (entry.name_short) { lookup[entry.name_short] = numericCode }
      })
      this._nameToGeoCode[geography] = lookup
    }
    const code = this._nameToGeoCode[geography][id]
    return code !== undefined ? code : id
  }

  parseCsv(csv, geography, customUpload) {
    const mapResource = geographyResource.getMapResource(geography)
    const features = mapResource.getUniqueFeatureIds()
    const badMapIds = []
    const badValueIds = []
    csv = csv.trim()
    let parsed
    if (geography === 'United States') {
      parsed = csvParseRows(csv, d => [this._validateFips(d[0]), parseFloat(d[1])])
    } else if (geography === 'Japan' || geography === 'Tokyo') {
      parsed = csvParseRows(csv, d => {
        const id = this._resolveJapaneseGeoCode(geography, d[0])
        const value = this._parseJapaneseNumber(d[1])
        if (typeof id === 'string' && isNaN(value)) {
          // neither column parses: treat as a header row and skip it
          return null
        }
        return [id, value]
      })
    } else {
      parsed = csvParseRows(csv, d => [d[0], parseFloat(d[1])])
    }
    if (customUpload) {
      // extra data validation for custom uploads
      parsed = parsed.filter(row => {
        const hasId = (features.indexOf(row[0]) > -1)
        if (!hasId) {
          badMapIds.push(row[0])
        }
        if (row[1] <= 0 || isNaN(row[1])) {
          badValueIds.push(row[0])
        }
        return hasId && row[1] > 0
      })
      if (badMapIds.length || badValueIds.length) {
        this._warnDataErrors(badMapIds, badValueIds)
      }
    }
    return parsed
  }

  _warnDataErrors(badMapIds, badValueIds) {
    const mapIdString = badMapIds.map(id => `"${id}"`).join(', ')
    const valueIdString = badValueIds.map(id => `"${id}"`).join(', ')
    let alertString = ''
    if (mapIdString) {
      alertString += `地図データに存在しないID（${mapIdString}）がありました。`
    }
    if (valueIdString) {
      alertString += `ID ${valueIdString} の値が0以下または数値ではありません。`
    }
    alertString += '該当する行は除外されました。'
    showWarningToast(alertString)
  }

  getLabels() {
    return this._datasets.map(dataset => dataset.label)
  }

  getDataset(geography, index) {
    return this.getDatasetsByGeography(geography)[index]
  }

  getDatasetGeography(index) {
    return this._datasets[index].geography
  }

  getDatasetsByGeography(geography) {
    return this._datasets.filter(dataset => dataset.geography === geography)
  }

  buildDatasetFromCustomCsv(geography, csv) {
    return {
      data: this.parseCsv(csv, geography, true),
      geography,
    }
  }
}

export default new DatasetResource()
