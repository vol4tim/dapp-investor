import _ from 'lodash';
import { Scene, addScene, sendScene, Session } from '../../utils/scene'
import { scenes, controls } from '../aira'

export const session = new Session()
addScene(new Scene('connect', scenes.connect, session));
addScene(new Scene('chart', scenes.chart, session));
addScene(new Scene('markets', scenes.markets, session));
addScene(new Scene('refill', scenes.refillMarket, session));
addScene(new Scene('income', scenes.income, session));
addScene(new Scene('top', scenes.top, session));

export default {
  help: () => `commands:
    - connect (Начало)
    - balance (Ваш баланс токена XRT)
    - refill (Инвестировать)
    - fund (Распределение капитала по рынкам)
    - distribution (Распределение фабрик)
    - income (Доход)
    - top (Топ 3 инвесторов)
  `,
  connect: (args, print, runCommand) => {
    sendScene('connect', { args, print, runCommand });
  },
  chart: (args, print, runCommand) => {
    sendScene('chart', { args, print, runCommand });
  },
  markets: (args, print, runCommand) => {
    sendScene('markets', { args, print, runCommand });
  },
  refill: (args, print, runCommand) => {
    sendScene('refill', { args, print, runCommand });
  },
  income: (args, print, runCommand) => {
    sendScene('income', { args, print, runCommand });
  },
  top: (args, print, runCommand) => {
    sendScene('top', { args, print, runCommand });
  },
  distribution: (args, print) => {
    controls.distributionFactory()
      .then((markets) => {
        let message = ''
        _.forEach(markets, (item, index) => {
          message += (Number(index) + 1) + '. ' + item.name + '. В производстве будут учавствовать ' + item.robots + ' умных фабрик\n'
        })
        return message
      })
      .then((result) => {
        print(result)
      })
  },
  fund: (args, print) => {
    controls.distributionFund()
      .then((markets) => {
        let message = ''
        _.forEach(markets, (item, i) => {
          message += '\n' + (Number(i) + 1) + '. ' + item.name + ' - ' + item.fund
        })
        return message
      })
      .then((result) => {
        print(result)
      })
  },
  balance: (args, print) => {
    controls.getUtility()
      .then(result => 'У вас на балансе ' + result.balance + ' ' + result.symbol + '. Доступно ' + result.approve + ' ' + result.symbol + '.')
      .then((result) => {
        print(result)
      })
  },
}
