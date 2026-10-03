import React from 'react'
import strings from '../strings'

export default function MobileRedirect(props) {
  return (
    <div className='mobile-redirect'>
      <div className='background'>
        <div className='main'>
          <div
            className='close-mobile'
            onClick={props.onClose}
          >&#215;</div>
          <h1>{strings.mobile.title}</h1>
          <img src={props.tilegramsLogo} className='tilegrams-logo' alt='Tilegrams' />
          <h2>{strings.mobile.lead}</h2>
          <h3>{strings.mobile.desktopOnly}</h3>
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
