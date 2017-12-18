import React from 'react'
import styles from './style.css'

const TerminalInput = props => (
  <div>
    <span className={styles.prompt}>&gt;</span>
    <span className={styles.a}>{props.input}</span>
    {props.focus &&
      <span className={styles.cursor}>|</span>
    }
  </div>
)

export default TerminalInput
