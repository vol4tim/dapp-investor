import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import hett, { ProviderAbi } from 'hett'
import configureStore from './config/store'
import Routes from './config/routes'
import * as abis from './abi'
import DepNetwork from './shared/components/app/depNetwork'
import { getNetworkName } from './utils/helper'
// import './index.html'

hett.init(web3, new ProviderAbi(abis));

const store = configureStore()

getNetworkName()
  .then((network) => {
    if (network === 'ropsten') {
      render(
        <Provider store={store}>
          <HashRouter>
            <Routes />
          </HashRouter>
        </Provider>,
        document.getElementById('root')
      )
    } else {
      render(
        <DepNetwork />,
        document.getElementById('root')
      )
    }
  })
