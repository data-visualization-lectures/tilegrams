import React from 'react'

const warningText = `地図に手動編集が加えられています。
新しいタイルグラムを生成したり、既存タイルグラムの解像度を変更すると、
これらの編集内容は失われます。`

export default function EditWarningModal(props) {
  return (
    <div
      className='modal-edit-warning'
      onClick={(event) => event.stopPropagation()}
    >
      <div className='warning-text'>
        {warningText}
        <br />
        <br />
        続行しますか？
        <br />
        <br />
        <a
          style={{float: 'left'}}
          onClick={props.startOver}
        >
          はい、続行する
        </a>
        <a
          style={{float: 'right'}}
          onClick={props.resumeEditing}
        >
          編集に戻る
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
