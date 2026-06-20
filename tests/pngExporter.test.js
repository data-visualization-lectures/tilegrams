const assert = require('assert')

const pngExporter = require('../source/file/PngExporter').default

const originalDocument = global.document

function createDocument({canvas}) {
  const body = {
    appended: [],
    removed: [],
    appendChild(element) {
      this.appended.push(element)
    },
    removeChild(element) {
      this.removed.push(element)
    },
  }

  return {
    body,
    createdLinks: [],
    querySelector(selector) {
      return selector === '#canvas canvas' ? canvas : null
    },
    createElement(tagName) {
      const element = {
        tagName,
        attributes: {},
        clicked: false,
        setAttribute(name, value) {
          this.attributes[name] = value
        },
        click() {
          this.clicked = true
        },
      }
      this.createdLinks.push(element)
      return element
    },
  }
}

try {
  global.document = createDocument({canvas: null})
  assert.strictEqual(pngExporter.toDataUrl(), null)
  assert.strictEqual(pngExporter.download(), false)

  const dataUrl = 'data:image/png;base64,abc'
  const canvas = {
    toDataURL(mimeType) {
      assert.strictEqual(mimeType, 'image/png')
      return dataUrl
    },
  }
  const documentWithCanvas = createDocument({canvas})
  global.document = documentWithCanvas

  assert.strictEqual(pngExporter.toDataUrl(), dataUrl)
  assert.strictEqual(pngExporter.download({filename: 'custom.png'}), true)
  assert.strictEqual(documentWithCanvas.createdLinks.length, 1)
  assert.strictEqual(documentWithCanvas.body.appended.length, 1)
  assert.strictEqual(documentWithCanvas.body.removed.length, 1)

  const link = documentWithCanvas.createdLinks[0]
  assert.strictEqual(link.attributes.download, 'custom.png')
  assert.strictEqual(link.attributes.href, dataUrl)
  assert.strictEqual(link.clicked, true)
} finally {
  global.document = originalDocument
}

console.log('PngExporter tests passed')
