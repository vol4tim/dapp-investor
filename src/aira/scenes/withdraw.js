import _ from 'lodash'
import { hett } from 'hett'
import { controls, utils } from '../../aira'
import { Scene, Wizard, Session } from '../../utils/scenes'

const withdraw1 = new Scene('withdraw1')
withdraw1.question = (ctx, session) => {
  ctx.loader();
  return controls.distributionMyFund()
    .then((markets) => {
      session.set('markets', markets)
      let message = 'Выбрать рынок для вывода стредств:'
      _.forEach(markets, (item, i) => {
        message += '\n' + (Number(i) + 1) + '. ' + item.name + ' - ' + item.fund
      })
      ctx.load(message);
    })
    .catch((e) => {
      ctx.load(e.toString() + '\n\n');
      return false
    })
}
withdraw1.answer = (ctx, session) => {
  ctx.push((input) => {
    const market = Number(input) - 1
    session.set('market', market)
    const markets = session.get('markets')
    if (_.has(markets, market) && markets[market].sum > 0) {
      ctx.pop();
      ctx.nextScene()
    }
  }, {
    prompt: 'Ваш ответ: ',
    keydown: (e) => {
      if (e.which === 67 && e.ctrlKey) {
        ctx.pop();
      }
    }
  });
}

const withdraw2 = new Scene('withdraw2')
withdraw2.question = (ctx) => {
  ctx.echo('Укажите сумму');
}
withdraw2.answer = (ctx, session) => {
  ctx.push((input) => {
    const market = session.get('market')
    const markets = session.get('markets')
    const value = Number(input)
    if (markets[market].sum >= value) {
      ctx.loader();
      controls.getModelByMarketIndex(market)
        .then(model => utils.withdraw(model, value))
        .then((txId) => {
          ctx.load('Отправленна транзакция на вывод. tx: ' + txId);
          ctx.loader();
          return hett().watcher.addTx(txId)
        })
        .then((transaction) => {
          ctx.load('blockNumber: ' + transaction.blockNumber);
          ctx.echo('Средства выведены');
          ctx.pop();
        })
        .catch((e) => {
          ctx.load(e.toString() + '\n\n');
          ctx.pop();
        })
    }
  }, {
    prompt: 'Ваш ответ: ',
    keydown: (e) => {
      if (e.which === 67 && e.ctrlKey) {
        ctx.pop();
      }
    }
  });
}

export default new Wizard('withdraw', new Session(), [withdraw1, withdraw2])
