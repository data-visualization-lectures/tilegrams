import React from 'react'

export default function ManualPanel(props) {
  const manualClass = props.open ? 'manual' : 'manual hidden'
  const MarkdownComponent = props.markdownComponent

  return (
    <div className={manualClass}>
      <div
        className='manual-close'
        onClick={props.onClose}
      >
        <i className='fa fa-times' />
      </div>
      <MarkdownComponent source={props.source} />
    </div>
  )
}

ManualPanel.propTypes = {
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func,
  source: React.PropTypes.string,
  markdownComponent: React.PropTypes.func,
}

ManualPanel.defaultProps = {
  open: false,
  onClose: () => {},
  source: '',
  markdownComponent: () => null,
}
