import React from 'react'

import GeographyResource from '../resources/GeographyResource'
import strings from '../strings'

export default function GeographySelector(props) {
  const selectGeography = (event) => {
    props.selectGeography(event.target.value)
  }
  const options = GeographyResource.getGeographies().map((geography, geographyIndex) => {
    return (
      <option
        key={geographyIndex}
        value={geography.label}
      >
        {geography.displayLabel || geography.label}
      </option>
    )
  })
  return (
    <div className='geographySelector'>
      {strings.geographySelector.label}
      <fieldset>
        <select onChange={selectGeography} value={props.selectedGeography}>
          {options}
        </select>
      </fieldset>
    </div>
  )
}
GeographySelector.propTypes = {
  selectedGeography: React.PropTypes.string,
  selectGeography: React.PropTypes.func,
}
