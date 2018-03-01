import axios from 'axios'
import _ from 'lodash'
import { hett } from 'hett'
import { INVESTOR_SUPPLY, UTILITY_TOKEN, WETH_TOKEN, URL_DATA_INVESTOR } from '../../config/config'
import * as utils from './utils'
import { formatDecimals, fromDecimals } from '../../utils/helper'

// вернет список рынков с данными за последние сутки (спрос, комиссия, доходность)
export function marketsInfo() {
  const data = {}
  return utils.getMarkets()
    .then((result) => {
      _.forEach(result, (item, i) => {
        data[i] = {
          index: i,
          name: item.name,
          ask: '-',
          fee: '-',
          income: '-'
        }
      })
      return utils.getMarketsFee()
    })
    .then((result) => {
      _.forEach(result, (fee, i) => {
        data[i].fee = fee + '%'
      })
      return utils.getMarketsAsk()
    })
    .then((result) => {
      _.forEach(result, (ask, i) => {
        data[i].ask = formatDecimals(ask, WETH_TOKEN.decimals) + ' ' + WETH_TOKEN.symbol
      })
      return utils.getMarketsIncome()
    })
    .then((result) => {
      _.forEach(result, (income, i) => {
        data[i].income = formatDecimals(income, WETH_TOKEN.decimals) + ' ' + WETH_TOKEN.symbol
      })
      return _.values(data)
    })
}

// вернет список рынков с поментами maxProfit и minBalance
export function marketsStat() {
  let names
  let maxProfit
  let minBalance
  return utils.getMarkets()
    .then((result) => {
      names = result
      return utils.getMarketMaxProfit()
    })
    .then((result) => {
      maxProfit = result
      return utils.getMarketMinBalance()
    })
    .then((result) => {
      minBalance = result
      return _.map(names, (item, i) => (
        {
          ...item,
          maxProfit: (maxProfit === Number(i)),
          minBalance: (minBalance === Number(i))
        }
      ))
    })
}

// распределение фабрик по рынкам в зависимости от распределения капитала
export function distributionFactory(forecast = null) {
  let markets = {}
  return utils.getMarkets()
    .then((result) => {
      markets = result
      return utils.getMarketsFund()
    })
    .then((marketsFund) => {
      const calcMarketsFund = marketsFund
      if (forecast !== null) {
        calcMarketsFund[forecast.index] += fromDecimals(forecast.amount, UTILITY_TOKEN.decimals)
      }
      let marketsRobot = {
        0: 0,
        1: 0,
        2: 0,
        3: 0
      }
      let i = 0
      while (i < 4) {
        marketsRobot = utils.smartFactory(calcMarketsFund, marketsRobot)
        i += 1
      }
      return _.map(markets, (item, index) => (
        {
          ...item,
          robots: marketsRobot[index]
        }
      ))
    })
}

// распределение капитала по рынкам
export function distributionFund() {
  let markets = {}
  return utils.getMarkets()
    .then((result) => {
      markets = result
      return utils.getMarketsFund()
    })
    .then(marketsFund => (
      _.map(markets, (item, index) => (
        {
          ...item,
          fund: formatDecimals(marketsFund[index], UTILITY_TOKEN.decimals) + ' ' + UTILITY_TOKEN.symbol
        }
      ))
    ))
}

// информация по токену Utility
export function getUtility() {
  let balance = 0
  return utils.loadBalance(UTILITY_TOKEN.address, hett().utils.coinbase)
    .then((result) => {
      balance = result
      return utils.loadApprove(UTILITY_TOKEN.address, INVESTOR_SUPPLY)
    })
    .then(result => (
      {
        balance: balance.balance,
        approve: result.approve,
        symbol: UTILITY_TOKEN.symbol
      }
    ))
}

// получить модель по индексу рынка
export function getModelByMarketIndex(index) {
  return utils.getMarkets()
    .then(result => result[index].model)
}

// получить данные о заработке
// type last || full
export function getIncome(type) {
  return axios.get(URL_DATA_INVESTOR + type + '/' + hett().utils.coinbase)
    .then(result => result.data)
    .then(result => formatDecimals(result[type], WETH_TOKEN.decimals) + ' ' + WETH_TOKEN.symbol)
}

// получить топ 3 инвесторов которые больше всего заработали
// type last || full
export function getTop(type) {
  return axios.get(URL_DATA_INVESTOR + 'top/' + type)
    .then(result => result.data)
    .then(result => (
      _.map(result, item => (
        {
          ...item,
          fund: formatDecimals(item[type], WETH_TOKEN.decimals) + ' ' + WETH_TOKEN.symbol
        }
      ))
    ))
}
