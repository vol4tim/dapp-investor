import Promise from 'bluebird'
import _ from 'lodash'
import { hett } from 'hett'
import Base58 from 'base-58'
import { MARKETS, FACTORY_LIABILITY, FACTORY_LIABILITY_TOPIC, INVESTOR_SUPPLY, UTILITY_TOKEN, SUB_BLOCK_DAY } from '../config/config'
import { formatDecimals, fromDecimals, currentBlock } from '../utils/helper'
import web3Beta from '../utils/web3Beta'

const getLog = (address, topics, from = 0) => {
  const options = {
    fromBlock: from, // current - SUB_BLOCK_DAY,
    toBlock: 'latest',
    address,
    topics: [topics],
  }
  return new Promise((resolve, reject) => {
    const filter = hett().eth.filter(options);
    filter.get((error, result) => {
      if (error) {
        reject(error);
      }
      resolve(result);
    })
  });
}

// получить данные по обязательству
function getLiability(address) {
  return hett().getContractByName('RobotLiability', address)
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

// получить название и символ токена
// function loadToken(address) {
//   return hett().getContractByName('Token', address)
//     .then(contract => (
//       Promise.join(
//         contract.call('name'),
//         contract.call('symbol'),
//         (...info) => (
//           {
//             name: info[0],
//             symbol: info[1]
//           }
//         )
//       )
//     ))
// }

// список рынков
export function getMarkets() {
  return new Promise((resolve) => {
    resolve(MARKETS);
  })
}

// комиссии рынков
export function getMarketsFee() {
  return hett().getContractByName('BuilderRobotLiability', FACTORY_LIABILITY)
    .then((contract) => {
      const calls = []
      _.forEach(MARKETS, (item) => {
        calls.push(contract.call('getMarketFee', [web3Beta.utils.bytesToHex(Base58.decode(item.model))]))
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

// каптал по каждому рынку
export function getMarketsFund() {
  return hett().getContractByName('InvestorSupply', INVESTOR_SUPPLY)
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

// исполненый спрос за последние сутки
export function getMarketsAsk() {
  return currentBlock()
    .then(result => getLog(FACTORY_LIABILITY, FACTORY_LIABILITY_TOPIC, result - SUB_BLOCK_DAY))
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

// получить доходы по каждому рынку за последние сутки
export function getMarketsIncome() {
  const log = []
  let fee = []
  return currentBlock()
    .then(result => getLog(FACTORY_LIABILITY, FACTORY_LIABILITY_TOPIC, result - SUB_BLOCK_DAY))
    .then((result) => {
      _.forEach(result, (value) => {
        log.push('0x' + value.topics[2].substring(value.topics[2].length - 40))
      })
      return getMarketsFee()
    })
    .then((result) => {
      fee = result
    })
    .then(() => {
      const contracts = [];
      _.forEach(log, (address) => {
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
          income[index] += (item.count * item.cost * fee[index]) / 100
        }
      })
      return income
    })
}

// получить рынок у котороко максимальный доход
export function getMarketMaxProfit() {
  return getMarketsIncome()
    .then((result) => {
      const max = _.max(_.values(result))
      return _.findIndex(_.values(result), v => v === max)
    })
}

// получить рынок на котором размещен минимальный капитал
export function getMarketMinBalance() {
  return getMarketsFund()
    .then((result) => {
      const min = _.min(_.values(result))
      return _.findIndex(_.values(result), v => v === min)
    })
}

// Капитал на Рынке А * (Сумма всех роботов/Сумма всего капитала)
function desiredDistribution(cap, sumCap, sumRob) {
  return cap * (sumRob / sumCap)
}

// Желаемое количество роботов - реальное количество, присутсвующих уже на рынке роботов
function distributionError(cap, rob, sumCap, sumRob) {
  return desiredDistribution(cap, sumCap, sumRob) - rob
}

// Рынок на который будет направлен очередная фабрика
export function currentMarketDistribution(capMarkets, robMarkets) {
  // http://ensrationis.com/smart-factory-and-capital/
  const sumCap = _.sum(_.values(capMarkets))
  const sumRob = _.sum(_.values(robMarkets)) + 1
  const e = {}
  _.forEach(capMarkets, (cap, indexMarket) => {
    e[indexMarket] = distributionError(cap, robMarkets[indexMarket], sumCap, sumRob)
  })
  const maxError = _.max(_.values(e))
  const indexesMarket = _.keys(e)
  return indexesMarket[_.findIndex(_.values(e), v => v === maxError)]
}

// получить баланс токенов
export function loadBalance(address, to) {
  return hett().getContractByName('Token', address)
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

// получить кол-во approve токенов
export function loadApprove(address, to) {
  return hett().getContractByName('Token', address)
    .then(contract => (
      Promise.join(
        contract.call('allowance', [hett().utils.coinbase, to]),
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

// отправляет транзакцию инвестирования в рынок
export function refill(market, value) {
  return hett().getContractByName('InvestorSupply', INVESTOR_SUPPLY)
    .then(contract => contract.send('refill', [market, fromDecimals(value, UTILITY_TOKEN.decimals)]))
}

// approve токена для инвестирования
export function approve(value) {
  return hett().getContractByName('Token', UTILITY_TOKEN.address)
    .then(contract => contract.send('approve', [INVESTOR_SUPPLY, fromDecimals(value, UTILITY_TOKEN.decimals)]))
}
