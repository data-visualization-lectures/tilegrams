import React from 'react'

export default function MobileRedirect(props) {
  return (
    <div className='mobile-redirect'>
      <div className='background'>
        <div className='main'>
          <div
            className='close-mobile'
            onClick={props.onClose}
          >&#215;</div>
          <h1>TILEGRAMS</h1>
          <img src={props.tilegramsLogo} className='tilegrams-logo' alt='Tilegrams' />
          <h2>データセットに比例して地域の大きさを調整したタイル地図を作成しましょう。</h2>
          <h3>最適な体験のためには、ノートパソコンまたはデスクトップコンピューターでご利用ください。</h3>
        </div>
      </div>
    </div>
  )
}

MobileRedirect.propTypes = {
  onClose: React.PropTypes.func,
  tilegramsLogo: React.PropTypes.string,
}

MobileRedirect.defaultProps = {
  onClose: () => {},
  tilegramsLogo: '',
}
