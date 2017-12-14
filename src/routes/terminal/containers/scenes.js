import React from 'react'
import _ from 'lodash'
import hett from 'hett'
import moment from 'moment'
import Table from './table'
import Chart, { loadData } from './chart'
import { getMarkets, getMarketMaxProfit, getMarketMinBalance, loadDataRate, getMarketsFund, smartFactory, refill, getUtility, approve } from './utils'

const USER_FUND = 1

export const connect = [
  (scene) => {
    scene.modules.terminal.addMessages([{
      content: `Хотите посмотреть текущую доходность роботизированных рынков?
  - Yes
  - No
      `,
      type: 'message'
    }]);
    return true
  },
  (scene, msg) => {
    if (msg.input.toLowerCase() === 'y' || msg.input.toLowerCase() === 'yes') {
      scene.modules.terminal.addMessages([{ content: '', type: 'message' }], true);
      return loadDataRate()
        .then((data) => {
          scene.modules.terminal.addMessages([{ content: <Table data={data} />, type: 'message' }]);
          scene.modules.terminal.setState({ wait: false })
          setTimeout(() => {
            scene.modules.terminal.doCommand('chart', false);
          }, 1000)
          return true
        })
        .catch((e) => {
          scene.modules.terminal.addMessages([{ content: 'Данные не получены \n' + e.toString() + '\n\n', type: 'message' }]);
          scene.modules.terminal.setState({ wait: false })
          scene.modules.terminal.doCommand('markets', false);
          return false
        })
    }
    scene.modules.terminal.setState({ wait: false })
    scene.modules.terminal.doCommand('chart', false);
    return true
  }
]

export const chart = [
  (scene) => {
    scene.modules.terminal.addMessages([{
      content: `Показать графики спроса и предложения для данных рынков за вчерашний день?
  - Yes
  - No
      `,
      type: 'message'
    }]);
    return true
  },
  (scene, msg) => {
    if (msg.input.toLowerCase() === 'y' || msg.input.toLowerCase() === 'yes') {
      scene.modules.terminal.addMessages([{ content: '', type: 'message' }], true);
      const startdate = moment();
      // // startdate.subtract(1, 'days');
      // startdate.startOf('week').format('DD-MM-YYYY');
      // startdate.endOf('week');
      // console.log(startdate.format('DD-MM-YYYY'));
      return loadData(startdate.subtract(1, 'days').format('YYYY-MM-DD'), startdate.format('YYYY-MM-DD'))
        .then((markets) => {
          if (markets.length > 0) {
            scene.modules.terminal.addMessages([{ content: <Chart markets={markets} />, type: 'message' }]);
          } else {
            scene.modules.terminal.addMessages([{ content: 'Данные для графика отсутствуют', type: 'message' }]);
          }
          scene.modules.terminal.setState({ wait: false })
          setTimeout(() => {
            scene.modules.terminal.doCommand('markets', false);
          }, 1000)
          return true
        })
        .catch((e) => {
          scene.modules.terminal.addMessages([{ content: 'Данные по графику не получены \n' + e.toString() + '\n\n', type: 'message' }]);
          scene.modules.terminal.setState({ wait: false })
          scene.modules.terminal.doCommand('markets', false);
          return false
        })
    }
    scene.modules.terminal.setState({ wait: false })
    scene.modules.terminal.doCommand('markets', false);
    return true
  }
]

export const markets = [
  (scene) => {
    let names
    let maxProfit
    let minBalance
    let message = 'Выбрать рынок для инвестирования:'
    scene.modules.terminal.addMessages([{ content: '', type: 'message' }], true);
    return getMarkets()
      .then((result) => {
        names = result
        return getMarketMaxProfit()
      })
      .then((result) => {
        maxProfit = result
        return getMarketMinBalance()
      })
      .then((result) => {
        minBalance = result
        _.forEach(names, (item, i) => {
          message += '\n' + (Number(i) + 1) + '. ' + item.name
          if (maxProfit === Number(i)) {
            message += ' Максимальная доходность на сегодня.'
          }
          if (minBalance === Number(i)) {
            message += ' Наименьший капитал на рынке на сегодня.'
          }
        })
        scene.modules.terminal.addMessages([{ content: message, type: 'message' }]);
        return names
      })
      .catch((e) => {
        scene.modules.terminal.addMessages([{ content: 'Данные не получены \n' + e.toString() + '\n\n', type: 'message' }]);
        scene.modules.terminal.setState({ wait: false })
        scene.modules.terminal.doCommand('markets', false);
        return false
      })
  },
  (scene, msg, history) => {
    const index = Number(msg.input) - 1
    if (_.has(history[0], index)) {
      return getMarketsFund()
        .then((marketsFund) => {
          const calcMarketsFund = marketsFund
          calcMarketsFund[index] += USER_FUND
          let marketsRobot = {
            0: 0,
            1: 0,
            2: 0,
            3: 0
          }
          let i = 0
          while (i < 4) {
            marketsRobot = smartFactory(calcMarketsFund, marketsRobot)
            i += 1
          }
          let message = 'Оценка ваших действий: ' + marketsRobot[index] + ' из 4 умных фабрик будут участвовать в производстве "' + history[0][index].name + '", если другие инвесторы не изменят свою стратегию.'
          message += '\n\nДля начала игры введите команду "game"'
          scene.modules.terminal.addMessages([{ content: message, type: 'message' }]);
          return index
        })
        .catch((e) => {
          scene.modules.terminal.addMessages([{ content: 'Данные не получены \n' + e.toString() + '\n\n', type: 'message' }]);
          scene.modules.terminal.setState({ wait: false })
          scene.modules.terminal.doCommand('markets', false);
          return false
        })
    }
    scene.modules.terminal.setState({ wait: false })
    return false
  },
  (scene, msg, history) => {
    if (msg.input.toLowerCase() === 'game') {
      const market = Number(history[1])
      const value = USER_FUND
      scene.modules.terminal.addMessages([{ content: '', type: 'message' }], true);
      return getMarkets()
        .then(result => refill(result[market].model, value))
        .then((txId) => {
          scene.modules.terminal.addMessages([{ content: 'tx: ' + txId, type: 'message' }]);
          scene.modules.terminal.addMessages([{ content: '', type: 'message' }], true);
          return hett.watcher.addTx(txId)
        })
        .then((transaction) => {
          scene.modules.terminal.addMessages([{ content: 'blockNumber: ' + transaction.blockNumber, type: 'message' }]);
          scene.modules.terminal.setState({ wait: false })
          return true
        })
        .catch((e) => {
          scene.modules.terminal.addMessages([{ content: 'Ошибка \n' + e.toString() + '\n\n', type: 'message' }]);
          scene.modules.terminal.setState({ wait: false })
          return false
        })
    }
    scene.modules.terminal.setState({ wait: false })
    return false
  }
]

export const refillMarket = [
  (scene) => {
    let message = 'Выбрать рынок для инвестирования:'
    scene.modules.terminal.addMessages([{ content: '', type: 'message' }], true);
    return getMarkets()
      .then((result) => {
        _.forEach(result, (item, i) => {
          message += '\n' + (Number(i) + 1) + '. ' + item.name
        })
        scene.modules.terminal.addMessages([{ content: message, type: 'message' }]);
        return result
      })
      .catch((e) => {
        scene.modules.terminal.addMessages([{ content: 'Данные не получены \n' + e.toString() + '\n\n', type: 'message' }]);
        scene.modules.terminal.setState({ wait: false })
        return false
      })
  },
  (scene, msg) => {
    const market = Number(msg.input)
    if (market >= 1 && market <= 4) {
      return getUtility()
        .then((result) => {
          scene.modules.terminal.addMessages([{ content: 'У вас на балансе ' + result.balance + ' XRT. Доступно ' + result.approve + ' XRT.', type: 'message' }]);
          if (result.balance > 0) {
            scene.modules.terminal.addMessages([{ content: 'Укажите сумму', type: 'message' }]);
          } else {
            scene.modules.terminal.addMessages([{ content: 'У вас не достаточно средств', type: 'message' }]);
            scene.modules.terminal.setState({ wait: false })
            return false
          }
          return {
            market: market - 1,
            token: result
          }
        })
    }
    return false
  },
  (scene, msg, history) => {
    const market = Number(history[1].market)
    const value = Number(msg.input)
    if (value > history[1].token.balance) {
      scene.modules.terminal.addMessages([{ content: 'У вас не достаточно средств', type: 'message' }]);
      scene.modules.terminal.setState({ wait: false })
      return false
    } else if (value > history[1].token.approve) {
      scene.modules.terminal.addMessages([{ content: '', type: 'message' }], true);
      return approve(value)
        .then((txId) => {
          scene.modules.terminal.addMessages([{ content: 'Отправленна транзакция на approve. tx: ' + txId, type: 'message' }]);
          scene.modules.terminal.addMessages([{ content: '', type: 'message' }], true);
          return hett.watcher.addTx(txId)
        })
        .then((transaction) => {
          scene.modules.terminal.addMessages([{ content: 'Approve выполнен', type: 'message' }]);
          scene.modules.terminal.addMessages([{ content: 'blockNumber: ' + transaction.blockNumber, type: 'message' }]);
          scene.modules.terminal.addMessages([{ content: 'Выполняется перевод средств', type: 'message' }], true);
          return getMarkets()
        })
        .then(result => refill(result[market].model, value))
        .then((txId) => {
          scene.modules.terminal.addMessages([{ content: 'Отправленна транзакция на перевод. tx: ' + txId, type: 'message' }]);
          scene.modules.terminal.addMessages([{ content: '', type: 'message' }], true);
          return hett.watcher.addTx(txId)
        })
        .then((transaction) => {
          scene.modules.terminal.addMessages([{ content: 'blockNumber: ' + transaction.blockNumber, type: 'message' }]);
          scene.modules.terminal.setState({ wait: false })
          return true
        })
        .catch((e) => {
          scene.modules.terminal.addMessages([{ content: 'Ошибка \n' + e.toString() + '\n\n', type: 'message' }]);
          scene.modules.terminal.setState({ wait: false })
          return false
        })
    }
    scene.modules.terminal.addMessages([{ content: '', type: 'message' }], true);
    return getMarkets()
      .then(result => refill(result[market].model, value))
      .then((txId) => {
        scene.modules.terminal.addMessages([{ content: 'Отправленна транзакция на перевод. tx: ' + txId, type: 'message' }]);
        scene.modules.terminal.addMessages([{ content: '', type: 'message' }], true);
        return hett.watcher.addTx(txId)
      })
      .then((transaction) => {
        scene.modules.terminal.addMessages([{ content: 'blockNumber: ' + transaction.blockNumber, type: 'message' }]);
        scene.modules.terminal.setState({ wait: false })
        return true
      })
      .catch((e) => {
        scene.modules.terminal.addMessages([{ content: 'Ошибка \n' + e.toString() + '\n\n', type: 'message' }]);
        scene.modules.terminal.setState({ wait: false })
        return false
      })
  }
]
