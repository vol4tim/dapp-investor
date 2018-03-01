import React from 'react'

const DepNetwork = props => (
  <div className="container">
    <h3>Dapp only works on the {props.nets.join(', ')} network</h3>
    <div>[ENG] For work, you need to switch the network.</div>
    <div>[RUS] Для дальнейшей работы требуется переключить сеть.</div>
  </div>
)

export default DepNetwork
