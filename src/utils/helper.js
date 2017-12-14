import Promise from 'bluebird'
import _ from 'lodash'
import hett from 'hett'
import BigNumber from 'bignumber.js'

export const formatDecimals = (price, decimals) => {
  const priceNum = new BigNumber(price);
  return priceNum.shift(-decimals).toNumber();
}

export const getNetwork = () => {
  const funcAsync = Promise.promisify(hett.web3.version.getNetwork);
  return funcAsync()
    .then(result => Number(result))
}

export const getNetworkName = () => (
  getNetwork()
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
