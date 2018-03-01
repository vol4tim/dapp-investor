import _ from 'lodash'
import { hett } from 'hett'
import BigNumber from 'bignumber.js'

export const formatDecimals = (price, decimals) => {
  const priceNum = new BigNumber(price);
  return priceNum.shift(-decimals).toString(10);
}

export const fromDecimals = (price, decimals) => {
  const priceNum = new BigNumber(price);
  return priceNum.shift(decimals).toNumber();
}

export const getNetworkName = () => (
  hett().utils.getNetworkAsync()
    .then((result) => {
      const networks = {
        1: 'main',
        3: 'ropsten',
        4: 'rinkeby',
        42: 'kovan'
      }
      if (_.has(networks, result)) {
        return networks[result]
      }
      return '???'
    })
)

export const currentBlock = () => (
  hett().utils.getBlockAsync('latest')
    .then(result => Number(result.number))
)
