import React from 'react'

function encodeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

const TerminalMessage = (props) => {
  let { message } = props
  if (typeof message !== 'object' && typeof message !== 'function') {
    message = encodeHTML(message);
  }
  return (
    <div className="d">
      {(typeof props.message === 'object' && typeof props.message !== 'function') ?
        message
        :
        <span dangerouslySetInnerHTML={{ __html: message }} />
      }
    </div>
  )
}

export default TerminalMessage
