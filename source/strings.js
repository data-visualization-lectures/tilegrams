/**
 * UI strings shown to users.
 * Geography / dataset / tilegram names live in source/resources/ instead.
 */
const strings = {
  intro: {
    lead: 'データセットに比例して地域の大きさを調整したタイル地図を作成しましょう。',
    manualBefore: '詳しい情報や手順については',
    manualLink: ' マニュアル',
    manualAfter: 'をご覧ください。',
  },
  steps: {
    generate: '1. 開く・作成する',
    refine: '2. タイルを調整する',
  },
  geographySelector: {
    label: '対象地域を選択',
  },
  tabs: {
    generate: 'データから作成',
    import: '完成済みを開く',
  },
  datasetSelector: {
    customOption: 'カスタムCSV（貼り付け）',
    csvInstruction: `CSVはヘッダー行なしで、1列目に地域ID、2列目に値を
          記入してください。3列目以降は無視されます。サンプルCSV:`,
    csvJapanNote: '日本の地図では、1列目に都道府県コード（1〜47）のほか、都道府県名（例: 東京都）も使えます。',
    csvPastePrompt: '下の欄にCSVを貼り付けてください:',
    csvSubmit: '反映する',
  },
  resolution: {
    label: '解像度',
    perTile: 'タイルあたり',
    perTileLabel: '1タイルあたりの値',
    finer: 'タイルを細かく（数を増やす）',
    coarser: 'タイルを粗く（数を減らす）',
    estimatedTiles: count => `合計 約${count}タイル`,
  },
  importControls: {
    uploadOption: 'タイルグラムをアップロード',
    usingFile: filename => `${filename} を使用中`,
  },
  labelMode: {
    label: '地名ラベルの表示',
    auto: '自動間引き（重なりを回避）',
    all: 'すべて表示',
    none: '非表示',
  },
  hexMetrics: {
    noData: 'データなし',
    showOnlyMismatched: unitName => `余剰または不足のある${unitName}のみを表示`,
    legendSurplus: '+n：多すぎる（n枚減らす）',
    legendDeficit: '−n：足りない（n枚増やす）',
    legendHint: '各カードの六角形を地図へドラッグするとタイルを追加できます',
    resolutionWarning: unitName =>
      `このデータの解像度では、いくつかの${unitName}が表示されません。より低い解像度を検討してください。`,
  },
  refineTooltip: '統計的に正確な形にするには、一部の地域で手動調整が必要です。',
  refineWarning: count => `要調整 ${count}`,
  refineWarningTitle: (count, unitName) => `${count}${unitName}でタイル数が目標とずれています`,
  editWarning: {
    text: `地図に手動編集が加えられています。
新しいタイルグラムを生成したり、既存タイルグラムの解像度を変更すると、
これらの編集内容は失われます。`,
    question: '続行しますか？',
    proceed: 'はい、続行する',
    resume: '編集に戻る',
  },
  tilegramNotice: {
    congressionalDistricts: '州ごとに分割されたタイルグラムを探していますか？',
    congressionalDistrictsLink: '州別のデータはこちらから確認できます。',
    india: 'このデータビジュアライゼーションは、インドの伝統的な地図をもとにした地図表現であり、地理的な正確性が100%保証されているわけではありません。',
  },
  mobile: {
    title: 'タイルグラム',
    lead: 'データセットに比例して地域の大きさを調整したタイル地図を作成しましょう。',
    desktopOnly: '最適な体験のためには、ノートパソコンまたはデスクトップコンピューターでご利用ください。',
  },
  canvas: {
    computing: 'タイルグラムを計算中...',
  },
  header: {
    saveProject: 'プロジェクトの保存',
    loadProject: 'プロジェクトの読込',
    export: 'エクスポート',
    // the header dropdown has a fixed width, so keep these short
    exportTopoJson: 'TopoJSON',
    exportSvg: 'SVG',
    exportPng: 'PNG',
  },
  messages: {
    processing: '処理中です',
    failed: '処理に失敗しました',
    needsAttention: '確認が必要です',
    preparingSave: '保存準備中です',
    exporting: '書き出し中です',
    readingFile: 'ファイルを読み込み中です',
    loadingProjectList: 'プロジェクト一覧を読み込み中です',
    loadingProject: 'プロジェクトを読み込み中です',
    savingProject: 'プロジェクトを保存中です',
    projectLoadFailed: 'プロジェクトファイルを読み込めませんでした',
    tilegramLoadFailed: 'タイルグラムファイルを読み込めませんでした。形式を確認してください。',
    pngFailed: '画像生成に失敗しました',
    confirmLeave: '本当にこのページから離脱しますか？セーブされていない作業がすべて失われます。',
  },
}

export default strings
