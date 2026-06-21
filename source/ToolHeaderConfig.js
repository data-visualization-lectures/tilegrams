import {showProcessingToast} from './ToolHeaderMessages'

function showSaveProjectModal(header, dependencies, projectState) {
  showProcessingToast('保存準備中です')
  const geography = dependencies.getGeography()
  const projectData = JSON.parse(dependencies.buildProjectJson(geography))
  header.showSaveModal({
    name: projectState.name,
    data: projectData,
    thumbnailDataUri: dependencies.getThumbnailDataUri(),
    existingProjectId: projectState.id,
  })
}

function buildExportMenuItems(dependencies) {
  return [
    {
      label: 'TopoJSON',
      action: () => {
        showProcessingToast('書き出し中です')
        dependencies.exportTopoJson(dependencies.getGeography())
      },
    },
    {
      label: 'SVG',
      action: () => {
        showProcessingToast('書き出し中です')
        dependencies.exportSvg(dependencies.getGeography())
      },
    },
    {
      label: 'PNG',
      action: () => {
        showProcessingToast('書き出し中です')
        dependencies.exportPng()
      },
    },
  ]
}

export function buildProjectConfig(dependencies, projectState) {
  return {
    appName: 'tilegrams',
    onProjectLoad: (projectData) => {
      dependencies.loadProject(projectData)
    },
    onProjectSave: (meta) => {
      projectState.id = meta.id
      projectState.name = meta.name
    },
  }
}

export function buildHeaderConfig(header, dependencies, projectState) {
  return {
    logo: {
      type: 'text',
      text: 'Tilegrams',
      textClass: 'font-bold text-lg text-white',
    },
    buttons: [
      {
        label: 'プロジェクトの保存',
        action: () => {
          showSaveProjectModal(header, dependencies, projectState)
        },
        align: 'right',
      },
      {
        label: 'プロジェクトの読込',
        action: () => {
          header.showLoadModal()
        },
        align: 'right',
      },
      {
        label: 'エクスポート',
        align: 'right',
        type: 'dropdown',
        items: buildExportMenuItems(dependencies),
      },
    ],
  }
}
