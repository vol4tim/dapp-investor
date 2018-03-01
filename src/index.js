/* eslint global-require: 0 */
import React from 'react'
import { render } from 'react-dom'
import Promise from 'bluebird'
import _ from 'lodash'
import { hett, ProviderAbi } from 'hett'
import * as dapp from './components/dapp'
import { getNetworkName } from './utils/helper'
import * as abis from './abi'
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
      require('./app');
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
let stepCurrent = 0;
const stepMax = 5;
const interval = setInterval(() => {
  if (typeof web3 !== 'undefined' && web3.eth.accounts.length > 0) {
    clearInterval(interval);
    init();
    canNetwork();
    return;
  } else if (stepCurrent >= stepMax) {
    clearInterval(interval);
    if (typeof web3 === 'undefined') {
      notWeb3();
    } else {
      notAccounts();
    }
    return;
  }
  stepCurrent += 1;
  if (typeof web3 !== 'undefined' && web3.eth.accounts.length <= 0) {
    console.log('load accounts', web3.eth.accounts);
  }
  loader();
}, 1000);
