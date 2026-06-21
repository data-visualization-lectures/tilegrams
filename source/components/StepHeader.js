import React from 'react'

export default function StepHeader({open, label, onClick, children}) {
  const handleKeyDown = (event) => {
    if (event.keyCode === 13 || event.keyCode === 32) {
      event.preventDefault()
      onClick(event)
    }
  }

  return (
    <div
      className={open ? 'step' : 'active step'}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role='button'
      tabIndex='0'
    >
      <span>{label}</span>
      {children}
      <span className='arrow' />
    </div>
  )
}

StepHeader.propTypes = {
  open: React.PropTypes.bool.isRequired,
  label: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func.isRequired,
  children: React.PropTypes.node,
}

StepHeader.defaultProps = {
  children: null,
}
