import React from 'react'
import strings from '../strings'

export default function TilegramNotice(props) {
  const selectedTilegram = props.selectedTilegram

  if (!selectedTilegram) {
    return null
  }

  if (
    props.generateOption === 'import' &&
    selectedTilegram.includes('アメリカ連邦下院選挙区 2018')
  ) {
    return (
      <div className='congressionalDistrictModal'>
        {strings.tilegramNotice.congressionalDistricts}
        <a
          href='./us-congressional-districts-2018.html'
          target='_blank'
          rel='noopener noreferrer'
        >
          {strings.tilegramNotice.congressionalDistrictsLink}
        </a>
      </div>
    )
  }

  if (selectedTilegram.includes('インド')) {
    return (
      <div className='congressionalDistrictModal india'>
        {strings.tilegramNotice.india}
      </div>
    )
  }

  return null
}

TilegramNotice.propTypes = {
  selectedTilegram: React.PropTypes.string,
  generateOption: React.PropTypes.string,
}

TilegramNotice.defaultProps = {
  selectedTilegram: null,
  generateOption: '',
}
