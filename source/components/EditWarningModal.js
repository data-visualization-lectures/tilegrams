import React from 'react'
import strings from '../strings'

export default function EditWarningModal(props) {
  return (
    <div
      className='modal-edit-warning'
      onClick={(event) => event.stopPropagation()}
    >
      <div className='warning-text'>
        {strings.editWarning.text}
        <br />
        <br />
        {strings.editWarning.question}
        <br />
        <br />
        <a
          style={{float: 'left'}}
          onClick={props.startOver}
        >
          {strings.editWarning.proceed}
        </a>
        <a
          style={{float: 'right'}}
          onClick={props.resumeEditing}
        >
          {strings.editWarning.resume}
        </a>
        <div style={{clear: 'both'}} />
      </div>
    </div>
  )
}

EditWarningModal.propTypes = {
  startOver: React.PropTypes.func,
  resumeEditing: React.PropTypes.func,
}

EditWarningModal.defaultProps = {
  startOver: () => {},
  resumeEditing: () => {},
}
