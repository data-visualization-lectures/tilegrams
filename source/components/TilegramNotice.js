import React from 'react'

export default function TilegramNotice(props) {
  const selectedTilegram = props.selectedTilegram

  if (!selectedTilegram) {
    return null
  }

  if (
    props.generateOption === 'import' &&
    selectedTilegram.includes('U.S. Congressional Districts 2018')
  ) {
    return (
      <div className='congressionalDistrictModal'>
        州ごとに分割されたタイルグラムを探していますか？
        <a
          href='./us-congressional-districts-2018.html'
          target='_blank'
          rel='noopener noreferrer'
        >
          州別のデータはこちらから確認できます。
        </a>
      </div>
    )
  }

  if (selectedTilegram.includes('India')) {
    return (
      <div className='congressionalDistrictModal india'>
        このデータビジュアライゼーションは、インドの伝統的な地図をもとにした地図表現であり、地理的な正確性が100%保証されているわけではありません。
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
