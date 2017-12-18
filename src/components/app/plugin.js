/* eslint react/jsx-no-target-blank: 0 */
import React from 'react'

const Plugin = function Plugin() {
  return (
    <div>
      <h3>Dapp only works on the ropsten network</h3>
      <div className="text-center">[ENG] To enter the game you will need Metamask connected to Ropsten <a href="https://metamask.io" target="_blank">Install Metamask</a></div>
      <div className="text-center">[RUS] Для игры вам понадобится Metamask, подключенный к сети Ropsten. <a href="https://metamask.io" target="_blank">Установить Metamask</a></div>
    </div>
  )
}

export default Plugin
