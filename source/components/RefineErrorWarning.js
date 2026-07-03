import React from 'react'

import geographyResource from '../resources/GeographyResource'

export default function RefineErrorWarning({
  geography,
  nErrors,
  onMouseOver,
  onMouseOut,
}) {
  if (nErrors <= 0) return null

  const unitName = geographyResource.getUnitName(geography)
  return (
    <span
      className='n-errors'
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <i className='fa fa-exclamation-triangle' /> {nErrors} {unitName}
    </span>
  )
}

RefineErrorWarning.propTypes = {
  geography: React.PropTypes.string.isRequired,
  nErrors: React.PropTypes.number.isRequired,
  onMouseOver: React.PropTypes.func.isRequired,
  onMouseOut: React.PropTypes.func.isRequired,
}
