import _ from 'lodash';
import { controls, scenes } from '../../aira'

function help() {
  this.terminal.echo(`commands:
- connect (Начало)
- balance (Ваш баланс токена XRT)
- refill (Инвестировать)
- fund (Распределение капитала по рынкам)
- distribution (Распределение фабрик)
- income (Доход)
- top (Топ 3 инвесторов)
  `)
}
function connect() {
  scenes.find('connect').enter(this.terminal)
}
function chart() {
  scenes.find('chart').enter(this.terminal)
}
function market() {
  scenes.find('market').enter(this.terminal)
}
function refill() {
  scenes.find('refill').enter(this.terminal)
}
function income() {
  scenes.find('income').enter(this.terminal)
}
function top() {
  scenes.find('top').enter(this.terminal)
}
function distribution() {
  this.terminal.loader();
  controls.distributionFactory()
    .then((markets) => {
      let message = ''
      _.forEach(markets, (item, index) => {
        message += (Number(index) + 1) + '. ' + item.name + '. В производстве будут учавствовать ' + item.robots + ' умных фабрик\n'
      })
      return message
    })
    .then((result) => {
      this.terminal.load(result);
    })
}
function fund() {
  this.terminal.loader();
  controls.distributionFund()
    .then((markets) => {
      let message = ''
      _.forEach(markets, (item, i) => {
        message += '\n' + (Number(i) + 1) + '. ' + item.name + ' - ' + item.fund
      })
      return message
    })
    .then((result) => {
      this.terminal.load(result);
    })
}
function balance() {
  this.terminal.loader();
  controls.getUtility()
    .then(result => 'У вас на балансе ' + result.balance + ' ' + result.symbol + '. Доступно ' + result.approve + ' ' + result.symbol + '.')
    .then((result) => {
      this.terminal.load(result);
    })
}

export default {
  help,
  connect,
  chart,
  market,
  refill,
  income,
  top,
  distribution,
  fund,
  balance
}
