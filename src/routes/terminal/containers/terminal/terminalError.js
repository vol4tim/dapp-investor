import React from 'react'

const TerminalError = props => (
  <div>
    <span>{props.message}: command not found</span>
  </div>
)

export default TerminalError
