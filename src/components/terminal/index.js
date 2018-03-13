import React from 'react'
import Terminal from './terminal'
import styles from './style.css'
import commands from './commands'

const AiraTerminal = () => (
  <div className={styles.root}>
    <div className={styles.wrapper}>
      <Terminal
        commands={commands}
        greetings={false}
        welcome={`Сеть экономики роботов приветствует нового инвестора.<br />
Меня зовут <b class="t-blue">AIRA</b>, я есть представление умных фабрик, способных самостоятельно заключать контракты обязательств на производство рыночных товаров.<br />
Чтобы начать выполните команду \`connect\``}
      />
    </div>
  </div>
)

export default AiraTerminal
