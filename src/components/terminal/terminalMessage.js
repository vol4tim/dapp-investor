import React from 'react'
import styles from './style.css'

// function encodeHTML(s) {
//   return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
// }

const TerminalMessage = (props) => {
  const { message } = props
  // if (typeof message !== 'object' && typeof message !== 'function') {
  //   message = encodeHTML(message);
  // }
  return (
    <div className={styles.d}>
      {(typeof props.message === 'object' && typeof props.message !== 'function') ?
        message
        :
        <span dangerouslySetInnerHTML={{ __html: message }} />
      }
    </div>
  )
}

export default TerminalMessage
