import React from 'react'
import { render } from 'react-dom'
import Promise from 'bluebird'
import _ from 'lodash'
import { hett, ProviderAbi } from 'hett'
import * as dapp from './components/dapp'
import { getNetworkName } from './utils/helper'
import * as abis from './abi'
import app from './app'
import './index.html'

const init = () => {
  hett(
    web3.eth,
    {
      fromWei: web3.fromWei,
      toWei: web3.toWei,
      getNetworkAsync: Promise.promisify(web3.version.getNetwork),
      getBlockAsync: Promise.promisify(web3.eth.getBlock)
    },
    null,
    new ProviderAbi(abis)
  )
}
const startApp = () => {
  hett().utils.setAccount(0)
    .then(() => {
      app()
    })
}
const notWeb3 = () => {
  render(
    <dapp.Plugin />,
    document.getElementById('root')
  )
}
const depNetwork = (nets) => {
  render(
    <dapp.DepNetwork nets={nets} />,
    document.getElementById('root')
  )
}
const notAccounts = () => {
  render(
    <dapp.NotAccounts />,
    document.getElementById('root')
  )
}
const loader = () => {
  render(
    <div className="container">
      <dapp.Load />
    </div>,
    document.getElementById('root')
  )
}
const canNetwork = () => {
  const nets = ['ropsten']
  getNetworkName()
    .then((network) => {
      if (_.indexOf(nets, network) >= 0) {
        startApp()
      } else {
        depNetwork(nets)
      }
    })
}

const listeningChangeAccount = () => {
  let [account] = web3.eth.accounts;
  const accountInterval = () => {
    if (web3.eth.accounts.length <= 0 && account !== undefined) {
      account = undefined
      notAccounts();
    } else if (web3.eth.accounts[0] !== account) {
      [account] = web3.eth.accounts;
      canNetwork();
    }
    setTimeout(() => {
      accountInterval()
    }, 1000);
  }
  accountInterval()
}

loader();
window.addEventListener('load', () => {
  if (typeof web3 !== 'undefined') {
    init();
    if (web3.eth.accounts.length > 0) {
      canNetwork();
    } else if (web3.eth.accounts.length <= 0) {
      notAccounts();
    }
    listeningChangeAccount();
  } else {
    notWeb3();
  }
})
