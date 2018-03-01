import React from 'react'
import _ from 'lodash'
import { hett } from 'hett'
import moment from 'moment'
import Table from '../table'
import Chart, { loadData as loadDataChart } from '../chart'
import * as utils from './utils'
import * as controls from './controls'
import { USER_FUND } from '../../config/config'

export const connect = [
  (scene, msg) => {
    msg.print(`Хотите посмотреть текущую доходность роботизированных рынков?
  y - Yes
  n - No
      `);
    return true
  },
  (scene, msg) => {
    const input = msg.cmd[0]
    if (input.toLowerCase() === 'y' || input.toLowerCase() === 'yes') {
      msg.print(<span className="loader" />);
      return controls.marketsInfo()
        .then((data) => {
          msg.runCommand('edit-line Данные за последние ≈ 24 часа');
          msg.print(<Table data={data} />);
          msg.runCommand('chart');
          return true
        })
        .catch((e) => {
          msg.runCommand('edit-line');
          msg.print('Данные не получены \n' + e.toString() + '\n\n');
          msg.runCommand('chart');
          return false
        })
    }
    msg.runCommand('chart');
    return true
  }
]

export const chart = [
  (scene, msg) => {
    msg.print(`Показать графики спроса и предложения для данных рынков за вчерашний день?
  y - Yes
  n - No
      `);
    return true
  },
  (scene, msg) => {
    const input = msg.cmd[0]
    if (input.toLowerCase() === 'y' || input.toLowerCase() === 'yes') {
      msg.print(<span className="loader" />);
      const startdate = moment();
      // startdate.subtract(1, 'days');
      // startdate.startOf('week').format('DD-MM-YYYY');
      // startdate.endOf('week');
      // console.log(startdate.format('DD-MM-YYYY'));
      return loadDataChart(startdate.subtract(1, 'days').format('YYYY-MM-DD'), startdate.format('YYYY-MM-DD'))
        .then((markets) => {
          msg.runCommand('edit-line');
          if (markets.length > 0) {
            msg.print(<Chart markets={markets} />);
          } else {
            msg.print('Данные для графика отсутствуют');
          }
          msg.runCommand('markets');
          return true
        })
        .catch((e) => {
          msg.runCommand('edit-line');
          msg.print('Данные по графику не получены \n' + e.toString() + '\n\n');
          msg.runCommand('markets');
          return false
        })
    }
    msg.runCommand('markets');
    return true
  }
]

export const markets = [
  (scene, msg) => {
    msg.print(<span className="loader" />);
    return controls.marketsStat()
      .then((result) => {
        let message = 'Выбрать рынок для инвестирования:'
        _.forEach(result, (item, i) => {
          message += '\n' + (Number(i) + 1) + '. ' + item.name
          if (item.maxProfit) {
            message += ' Максимальная доходность на сегодня.'
          }
          if (item.minBalance) {
            message += ' Наименьший капитал на рынке на сегодня.'
          }
        })
        msg.runCommand('edit-line ' + message);
        return result
      })
      .catch((e) => {
        msg.runCommand('edit-line');
        msg.print('Данные не получены \n' + e.toString() + '\n\n');
        return false
      })
  },
  (scene, msg, history) => {
    const input = msg.cmd[0]
    const index = Number(input) - 1
    if (_.has(history[0], index)) {
      msg.print(<span className="loader" />);
      return controls.distributionFactory({ index, amount: USER_FUND })
        .then((result) => {
          let message = ''
          _.forEach(result, (item, i) => {
            if (i === index) {
              message += 'Оценка ваших действий: ' + item.robots + ' из 4 умных фабрик будут участвовать в производстве "' + item.name + '", если другие инвесторы не изменят свою стратегию.'
            }
          })
          message += '\n\nДля начала игры введите команду "game"'
          msg.runCommand('edit-line ' + message);
          return index
        })
        .catch((e) => {
          msg.runCommand('edit-line');
          msg.print('Данные не получены \n' + e.toString() + '\n\n');
          return false
        })
    }
    return false
  },
  (scene, msg, history) => {
    const input = msg.cmd[0]
    if (input.toLowerCase() === 'game') {
      const market = Number(history[1])
      msg.print(<span className="loader" />);
      return controls.getUtility()
        .then((result) => {
          msg.runCommand('edit-line У вас на балансе ' + result.balance + ' ' + result.symbol + '. Доступно ' + result.approve + ' ' + result.symbol + '.');
          if (result.balance <= 0) {
            msg.print('У вас не достаточно средств');
            return false
          }
          msg.print(`Отправить транзакцию?
  y - Yes
  n - No
            `);
          return {
            market,
            token: result
          }
        })
        .catch((e) => {
          msg.runCommand('edit-line');
          msg.print('Ошибка \n' + e.toString() + '\n\n');
          return false
        })
    }
    return false
  },
  (scene, msg, history) => {
    const input = msg.cmd[0]
    if (input.toLowerCase() === 'y' || input.toLowerCase() === 'yes') {
      const market = Number(history[2].market)
      const value = USER_FUND
      if (value > history[2].token.balance) {
        msg.print('У вас не достаточно средств');
        return false
      } else if (value > history[2].token.approve) {
        msg.print(<span className="loader" />);
        return utils.approve(value)
          .then((txId) => {
            msg.runCommand('edit-line Отправленна транзакция на approve. tx: ' + txId);
            msg.print(<span className="loader" />);
            return hett().watcher.addTx(txId)
          })
          .then((transaction) => {
            msg.runCommand('edit-line Approve выполнен');
            msg.print('blockNumber: ' + transaction.blockNumber);
            msg.print('Выполняется перевод средств', true);
            return controls.getModelByMarketIndex(market)
          })
          .then(model => utils.refill(model, value))
          .then((txId) => {
            msg.print('Отправленна транзакция на перевод. tx: ' + txId);
            msg.print(<span className="loader" />);
            return hett().watcher.addTx(txId)
          })
          .then((transaction) => {
            msg.runCommand('edit-line blockNumber: ' + transaction.blockNumber);
            msg.print('Ваши средства переведены');
            return true
          })
          .catch((e) => {
            msg.runCommand('edit-line');
            msg.print('Ошибка \n' + e.toString() + '\n\n');
            return false
          })
      }
      msg.print(<span className="loader" />);
      return controls.getModelByMarketIndex(market)
        .then(model => utils.refill(model, value))
        .then((txId) => {
          msg.runCommand('edit-line Отправленна транзакция на перевод. tx: ' + txId);
          msg.print(<span className="loader" />);
          return hett().watcher.addTx(txId)
        })
        .then((transaction) => {
          msg.runCommand('edit-line blockNumber: ' + transaction.blockNumber);
          msg.print('Ваши средства переведены');
          return true
        })
        .catch((e) => {
          msg.runCommand('edit-line');
          msg.print('Ошибка \n' + e.toString() + '\n\n');
          return false
        })
    }
    return false
  }
]

export const refillMarket = [
  (scene, msg) => {
    let message = 'Выбрать рынок для инвестирования:'
    msg.print(<span className="loader" />);
    return utils.getMarkets()
      .then((result) => {
        _.forEach(result, (item, i) => {
          message += '\n' + (Number(i) + 1) + '. ' + item.name
        })
        msg.runCommand('edit-line ' + message);
        return result
      })
      .catch((e) => {
        msg.runCommand('edit-line Данные не получены \n' + e.toString() + '\n\n');
        return false
      })
  },
  (scene, msg) => {
    const input = msg.cmd[0]
    const market = Number(input)
    if (market >= 1 && market <= 4) {
      return controls.getUtility()
        .then((result) => {
          msg.print('У вас на балансе ' + result.balance + ' ' + result.symbol + '. Доступно ' + result.approve + ' ' + result.symbol + '.');
          if (result.balance > 0) {
            msg.print('Укажите сумму');
          } else {
            msg.print('У вас не достаточно средств');
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
    const input = msg.cmd[0]
    const market = Number(history[1].market)
    const value = Number(input)
    if (value > history[1].token.balance) {
      msg.print('У вас не достаточно средств');
      return false
    } else if (value > history[1].token.approve) {
      msg.print(<span className="loader" />);
      return utils.approve(value)
        .then((txId) => {
          msg.runCommand('edit-line Отправленна транзакция на approve. tx: ' + txId);
          msg.print(<span className="loader" />);
          return hett().watcher.addTx(txId)
        })
        .then((transaction) => {
          msg.runCommand('edit-line Approve выполнен');
          msg.print('blockNumber: ' + transaction.blockNumber);
          msg.print('Выполняется перевод средств', true);
          return controls.getModelByMarketIndex(market)
        })
        .then(model => utils.refill(model, value))
        .then((txId) => {
          msg.print('Отправленна транзакция на перевод. tx: ' + txId);
          msg.print(<span className="loader" />);
          return hett().watcher.addTx(txId)
        })
        .then((transaction) => {
          msg.runCommand('edit-line blockNumber: ' + transaction.blockNumber);
          msg.print('Ваши средства переведены');
          return true
        })
        .catch((e) => {
          msg.runCommand('edit-line');
          msg.print('Ошибка \n' + e.toString() + '\n\n');
          return false
        })
    }
    msg.print(<span className="loader" />);
    return controls.getModelByMarketIndex(market)
      .then(model => utils.refill(model, value))
      .then((txId) => {
        msg.runCommand('edit-line Отправленна транзакция на перевод. tx: ' + txId);
        msg.print(<span className="loader" />);
        return hett().watcher.addTx(txId)
      })
      .then((transaction) => {
        msg.runCommand('edit-line blockNumber: ' + transaction.blockNumber);
        msg.print('Ваши средства переведены');
        return true
      })
      .catch((e) => {
        msg.runCommand('edit-line');
        msg.print('Ошибка \n' + e.toString() + '\n\n');
        return false
      })
  }
]

export const income = [
  (scene, msg) => {
    msg.print(`Ваш доход
  1 - Последний период
  2 - За все время
      `);
    return true
  },
  (scene, msg) => {
    const input = msg.cmd[0]
    const type = (Number(input) === 2) ? 'full' : 'last'
    msg.print(<span className="loader" />);
    return controls.getIncome(type)
      .then((result) => {
        msg.runCommand('edit-line Ваш доход: ' + result);
        return true
      })
      .catch((e) => {
        msg.runCommand('edit-line Ошибка \n' + e.toString() + '\n\n');
        return false
      })
  }
]

export const top = [
  (scene, msg) => {
    msg.print(`Топ инвесторов
  1 - Последний период
  2 - За все время
      `);
    return true
  },
  (scene, msg) => {
    const input = msg.cmd[0]
    const type = (Number(input) === 2) ? 'full' : 'last'
    msg.print(<span className="loader" />);
    return controls.getTop(type)
      .then((result) => {
        let message = ''
        _.forEach(result, (item, i) => {
          message += (i + 1) + '. ' + item.account + ': ' + item.fund + '\n'
        })
        msg.runCommand('edit-line ' + message);
        return true
      })
      .catch((e) => {
        msg.runCommand('edit-line Ошибка \n' + e.toString() + '\n\n');
        return false
      })
  }
]
