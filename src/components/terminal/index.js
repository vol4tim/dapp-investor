import React from 'react'
import Terminal from 'terminal-in-react';
import commands, { session } from './commands'
import { sendScene } from '../../utils/scene'
import styles from './style.css'

const commandPassThrough = (cmd, print, runCommand) => {
  if (session.has('current_command') && session.get('current_command')) {
    sendScene('next', { cmd, print, runCommand });
  } else {
    print(`${cmd}: command not found`);
  }
}

const AiraTerminal = () => (
  <div className={styles.root}>
    <div className={styles.wrapper}>
      <Terminal
        allowTabs={false}
        color="#d7db74"
        backgroundColor="#333"
        prompt="#e92672"
        outputColor="#fff"
        barColor="#ccc"
        style={{
          fontSize: 14, lineHeight: 1.5, fontFamily: 'Roboto Mono, Ubuntu Mono, Courier New, monospace'
        }}
        hideTopBar
        startState="maximised"
        commandPassThrough={commandPassThrough}
        commands={commands}
        msg={`Сеть экономики роботов приветствует нового инвестора.
        Меня зовут AIRA, я есть представление умных фабрик, способных самостоятельно заключать контракты обязательств на производство рыночных товаров.
        Чтобы начать выполните команду \`connect\``}
      />
    </div>
  </div>
)

export default AiraTerminal
