import {showProcessingToast} from './ToolHeaderMessages'
import strings from './strings'

function showSaveProjectModal(header, dependencies, projectState) {
  showProcessingToast(strings.messages.preparingSave)
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
      label: strings.header.exportTopoJson,
      action: () => {
        showProcessingToast(strings.messages.exporting)
        dependencies.exportTopoJson(dependencies.getGeography())
      },
    },
    {
      label: strings.header.exportSvg,
      action: () => {
        showProcessingToast(strings.messages.exporting)
        dependencies.exportSvg(dependencies.getGeography())
      },
    },
    {
      label: strings.header.exportPng,
      action: () => {
        showProcessingToast(strings.messages.exporting)
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
        label: strings.header.saveProject,
        action: () => {
          showSaveProjectModal(header, dependencies, projectState)
        },
        align: 'right',
      },
      {
        label: strings.header.loadProject,
        action: () => {
          header.showLoadModal()
        },
        align: 'right',
      },
      {
        label: strings.header.export,
        align: 'right',
        type: 'dropdown',
        items: buildExportMenuItems(dependencies),
      },
    ],
  }
}
