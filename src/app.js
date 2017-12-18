import React from 'react'
import { render } from 'react-dom'
import hett, { ProviderAbi } from 'hett'
import * as abis from './abi'
import DepNetwork from './components/app/depNetwork'
import Terminal from './components/aira'
import { getNetworkName } from './utils/helper'

hett.init(web3, new ProviderAbi(abis));

getNetworkName()
  .then((network) => {
    if (network === 'ropsten') {
      render(
        <Terminal />,
        document.getElementById('root')
      )
    } else {
      render(
        <DepNetwork />,
        document.getElementById('root')
      )
    }
  })
