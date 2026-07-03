import pitchElectoralCollegeTilegram from '../../tilegrams/pitch-electoral-college.json'
import pitchPopulationTilegram from '../../tilegrams/pitch-us-population-500k.json'
import nprOneToOneTilegram from '../../tilegrams/npr-one-to-one.json'
import fiveThirtyEightElectoralCollegeTilegram from
  '../../tilegrams/fivethirtyeight-electoral-college-tilegram.json'
import francePopulationTilegram from '../../tilegrams/france-population.json'
import francePopulationWithOverseasTilegram from
  '../../tilegrams/france-population-with-overseas.json'
import franceOneToOneDepartmentsTilegram from '../../tilegrams/france-departments-one-to-one.json'
import germanyOneToOneConstituenciesTilegram from '../../tilegrams/germany-constituencies.json'
import usCongress2018 from '../../tilegrams/us-congressional-districts-2018.json'
import usCongress2018brokenOut from '../../tilegrams/us-congressional-districts-2018-brokenout.json'
import brazilStatesPopulation2018 from '../../tilegrams/brazil-states-population.json'
import ukRegions from '../../tilegrams/uk-regions.json';
import indiaConstituencies from '../../tilegrams/india-constituencies.json';
import japanPrefecturesOneToOne from '../../tilegrams/japan-prefectures-one-to-one.json';

class TilegramResource {
  constructor() {
    this._tilegrams = [
      {
        label: '日本 都道府県 1対1',
        topoJson: japanPrefecturesOneToOne,
        geography: 'Japan',
      },
      {
        label: 'Pitch アメリカ大統領選挙人',
        topoJson: pitchElectoralCollegeTilegram,
        geography: 'United States',
      },
      {
        label: 'Pitch アメリカの人口 2016',
        topoJson: pitchPopulationTilegram,
        geography: 'United States',
      },
      {
        label: 'FiveThirtyEight アメリカ大統領選挙人',
        topoJson: fiveThirtyEightElectoralCollegeTilegram,
        geography: 'United States',
      },
      {
        label: 'NPR 1対1',
        topoJson: nprOneToOneTilegram,
        geography: 'United States',
      },
      {
        label: 'アメリカ連邦下院選挙区 2018',
        topoJson: usCongress2018,
        geography: 'United States',
      },
      {
        label: 'アメリカ連邦下院選挙区 2018（州別に分割）',
        topoJson: usCongress2018brokenOut,
        geography: 'United States',
      },
      {
        label: 'フランスの人口',
        topoJson: francePopulationTilegram,
        geography: 'France - Regions',
      },
      {
        label: 'フランスの人口（海外領土を含む）',
        topoJson: francePopulationWithOverseasTilegram,
        geography: 'France - Regions',
      },
      {
        label: 'フランス県 1対1',
        topoJson: franceOneToOneDepartmentsTilegram,
        geography: 'France - Departments',
      },
      {
        label: 'ドイツ連邦議会選挙区 1対1',
        topoJson: germanyOneToOneConstituenciesTilegram,
        geography: 'Germany - Constituencies',
      },
      {
        label: 'ブラジル州別人口 2017',
        topoJson: brazilStatesPopulation2018,
        geography: 'Brazil',
      },
      {
        label: 'イギリス地域',
        topoJson: ukRegions,
        geography: 'United Kingdom - Regions',
      },
      {
        label: 'インド選挙区',
        topoJson: indiaConstituencies,
        geography: 'India',
      },
    ]
  }

  getLabels() {
    return this._tilegrams.map(tilegram => tilegram.label)
  }

  getTilegram(geography, index) {
    const tilegram = this.getTilegramsByGeography(geography)[index]
    return tilegram ? tilegram.topoJson : undefined
  }

  getTilegramsByGeography(geography) {
    return this._tilegrams.filter(tilegram => tilegram.geography === geography)
  }
}

export default new TilegramResource()
