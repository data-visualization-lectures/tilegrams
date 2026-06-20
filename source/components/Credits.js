import React from 'react'

export default function Credits(props) {
  return (
    <h2 className='credits'>
      A project by
      <a
        href='http://pitchinteractive.com/'
        target='_blank'
        rel='noopener noreferrer'
      >
        Pitch Interactive
      </a>
      in association with
      <a
        href='https://newslab.withgoogle.com/'
        target='_blank'
        rel='noopener noreferrer'
      >
        <img src={props.googleNewsLabLogo} className='gnl-logo' alt='Google News Lab' />
      </a>
    </h2>
  )
}

Credits.propTypes = {
  googleNewsLabLogo: React.PropTypes.string,
}

Credits.defaultProps = {
  googleNewsLabLogo: '',
}
