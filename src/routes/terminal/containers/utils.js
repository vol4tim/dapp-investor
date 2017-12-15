import Promise from 'bluebird'
import _ from 'lodash'
import hett from 'hett'
import Base58 from 'base-58'
import { MARKETS, FACTORY_LIABILITY, FACTORY_LIABILITY_TOPIC, INVESTOR_SUPPLY, UTILITY_TOKEN } from '../../../config/config'
import utils from '../../../../web3_modules/web3-utils'
import { formatDecimals } from '../../../utils/helper'

const web3Beta = {
  utils
}

export function getMarkets() {
  return new Promise((resolve) => {
    resolve(MARKETS);
  })
}

export function getMarketsFund() {
  return hett.getContractByName('InvestorSupply', INVESTOR_SUPPLY)
    .then((contract) => {
      const calls = []
      _.forEach(MARKETS, (item) => {
        calls.push(contract.call('supply', [item.model]))
      })
      return Promise.join(
        ...calls,
        (...supply) => {
          const result = {}
          _.forEach(MARKETS, (item, index) => {
            result[index] = Number(supply[index])
          })
          return result
        }
      )
    })
}

export const getLog = (address, topics) => {
  const options = {
    fromBlock: 0,
    toBlock: 'latest',
    address,
    topics: [topics],
  }
  return new Promise((resolve, reject) => {
    const filter = hett.web3.eth.filter(options);
    filter.get((error, result) => {
      if (error) {
        reject(error);
      }
      resolve(result);
    })
  });
}

function getLiability(address) {
  return hett.getContractByName('RobotLiability', address)
    .then(contract => (
      Promise.join(
        contract.call('model'),
        contract.call('count'),
        contract.call('cost'),
        contract.call('result'),
        (model, count, cost, result) => (
          {
            address,
            model: Base58.encode(web3Beta.utils.hexToBytes(model)),
            count: Number(count),
            cost: Number(cost),
            result
          }
        )
      )
    ))
    .then((result) => {
      if (result.result === '0x') {
        return false
      }
      return result
    })
}

export function getMarketsAsk() {
  return getLog(FACTORY_LIABILITY, FACTORY_LIABILITY_TOPIC)
    .then((result) => {
      const log = []
      _.forEach(result, (value) => {
        log.push('0x' + value.topics[2].substring(value.topics[2].length - 40))
      })
      return log
    })
    .then((addresses) => {
      const contracts = [];
      _.forEach(addresses, (address) => {
        contracts.push(getLiability(address));
      })
      return Promise.all(contracts)
    })
    .then((result) => {
      const asks = {}
      _.forEach(MARKETS, (item, index) => {
        asks[index] = 0
      })
      _.forEach(_.compact(result), (item) => {
        const index = _.findKey(MARKETS, o => o.model === item.model);
        if (index >= 0) {
          asks[index] += item.count * item.cost
        }
      })
      return asks
    })
}

export function getMarketsIncome() {
  return getLog(FACTORY_LIABILITY, FACTORY_LIABILITY_TOPIC)
    .then((result) => {
      const log = []
      _.forEach(result, (value) => {
        log.push('0x' + value.topics[2].substring(value.topics[2].length - 40))
      })
      return log
    })
    .then((addresses) => {
      const contracts = [];
      _.forEach(addresses, (address) => {
        contracts.push(getLiability(address));
      })
      return Promise.all(contracts)
    })
    .then((result) => {
      const income = {}
      _.forEach(MARKETS, (item, index) => {
        income[index] = 0
      })
      _.forEach(_.compact(result), (item) => {
        const index = _.findKey(MARKETS, o => o.model === item.model);
        if (index >= 0) {
          income[index] += (item.count * item.cost * MARKETS[index].fee) / 100
        }
      })
      return income
    })
}

export function loadDataRate() {
  const data = {}
  return getMarkets()
    .then((result) => {
      _.forEach(result, (item, i) => {
        data[i] = {
          index: i,
          name: item.name,
          ask: '-',
          fee: item.fee + '%',
          income: '-'
        }
      })
      return getMarketsAsk()
    })
    .then((result) => {
      _.forEach(result, (ask, i) => {
        data[i].ask = ask + ' WETH'
      })
      return getMarketsIncome()
    })
    .then((result) => {
      _.forEach(result, (income, i) => {
        data[i].income = income + ' WETH'
      })
      return _.values(data)
    })
}

export function getMarketMaxProfit() {
  return getMarketsIncome()
    .then((result) => {
      const max = _.max(_.values(result))
      return _.findIndex(_.values(result), v => v === max)
    })
}

export function getMarketMinBalance() {
  return getMarketsFund()
    .then((result) => {
      const min = _.min(_.values(result))
      return _.findIndex(_.values(result), v => v === min)
    })
}

export function loadBalance(address, to) {
  return hett.getContractByName('Token', address)
    .then(contract => (
      Promise.join(
        contract.call('balanceOf', [to]),
        contract.call('decimals'),
        (balance, decimals) => (
          {
            balance: formatDecimals(balance, decimals),
          }
        )
      )
    ))
    .then(info => (
      {
        address,
        to,
        balance: info.balance
      }
    ))
}

export function loadApprove(address, to) {
  return hett.getContractByName('Token', address)
    .then(contract => (
      Promise.join(
        contract.call('allowance', [hett.web3h.coinbase(), to]),
        contract.call('decimals'),
        (allowance, decimals) => (
          {
            approve: formatDecimals(allowance, decimals)
          }
        )
      )
    ))
    .then(info => (
      {
        address,
        to,
        approve: info.approve
      }
    ))
}

export function loadToken(address) {
  return hett.getContractByName('Token', address)
    .then(contract => (
      Promise.join(
        contract.call('name'),
        contract.call('symbol'),
        (...info) => (
          {
            name: info[0],
            symbol: info[1]
          }
        )
      )
    ))
}

export function getUtility() {
  let balance = 0
  return loadBalance(UTILITY_TOKEN, hett.web3h.coinbase())
    .then((result) => {
      balance = result
      return loadApprove(UTILITY_TOKEN, INVESTOR_SUPPLY)
    })
    .then(result => (
      {
        balance: balance.balance,
        approve: result.approve
      }
    ))
}

export function refill(market, value) {
  return hett.getContractByName('InvestorSupply', INVESTOR_SUPPLY)
    .then(contract => contract.send('refill', [market, value]))
}

export function approve(value) {
  return hett.getContractByName('Token', UTILITY_TOKEN)
    .then(contract => contract.send('approve', [INVESTOR_SUPPLY, value]))
}

export function smartFactory(marketsFunds, currentStateFactory) {
  const fullFund = _.sum(_.values(marketsFunds))
  const sumRobots = _.sum(_.values(currentStateFactory)) + 1
  const R = {}
  const e = {}
  _.forEach(marketsFunds, (fund, i) => { R[i] = fund * (sumRobots / fullFund) })
  _.forEach(R, (r, i) => { e[i] = r - currentStateFactory[i] })
  const max = _.max(_.values(e))
  const keys = _.keys(e)
  const k = keys[_.findIndex(_.values(e), v => v === max)]
  const newStateFactory = currentStateFactory
  newStateFactory[k] += 1
  return newStateFactory
}
