class PngExporter {
  getCanvas(selector = '#canvas canvas') {
    return document.querySelector(selector)
  }

  toDataUrl(selector) {
    const canvasEl = this.getCanvas(selector)
    return canvasEl ? canvasEl.toDataURL('image/png') : null
  }

  download({selector, filename = 'tilegram.png'} = {}) {
    const dataUrl = this.toDataUrl(selector)
    if (!dataUrl) {
      return false
    }

    const link = document.createElement('a')
    link.setAttribute('download', filename)
    link.setAttribute('href', dataUrl)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return true
  }
}

export default new PngExporter()
