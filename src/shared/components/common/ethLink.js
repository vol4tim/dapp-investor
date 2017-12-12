/* eslint react/jsx-no-target-blank: 0 */
import React from 'react'
import _ from 'lodash'

const EthLink = (props) => {
  let title = props.address
  if (!_.isEmpty(props.title)) {
    title = props.title
  }
  let label = title
  if (props.small) {
    label = <small>{title}</small>
  }
  if (!_.isEmpty(props.label)) {
    label = <span className={'label label-' + props.label}>{title}</span>
  }
  let type = 'address'
  if (!_.isEmpty(props.type)) {
    type = props.type
  }
  return <a href={'https://kovan.etherscan.io/' + type + '/' + props.address} style={props.style} target="_blank">{label}</a>
}

export default EthLink
