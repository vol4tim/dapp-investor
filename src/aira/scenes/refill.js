import _ from 'lodash'
import { hett } from 'hett'
import { controls, utils } from '../../aira'
import { Scene, Wizard, Session } from '../../utils/scenes'

const refill1 = new Scene('refill1')
refill1.question = (ctx) => {
  ctx.loader();
  return utils.getMarkets()
    .then((result) => {
      let message = 'Выбрать рынок для инвестирования:'
      _.forEach(result, (item, i) => {
        message += '\n' + (Number(i) + 1) + '. ' + item.name
      })
      ctx.load(message);
    })
    .catch((e) => {
      ctx.load(e.toString() + '\n\n');
      return false
    })
}
refill1.answer = (ctx, session) => {
  ctx.push((input) => {
    const market = Number(input)
    session.set('market', market)
    if (market >= 1 && market <= 4) {
      ctx.loader();
      controls.getUtility()
        .then((result) => {
          session.set('token', result)
          ctx.load('У вас на балансе ' + result.balance + ' ' + result.symbol + '. Доступно ' + result.approve + ' ' + result.symbol + '.');
          if (result.balance <= 0) {
            ctx.echo('У вас не достаточно средств');
            ctx.pop();
          } else {
            ctx.pop();
            ctx.nextScene()
          }
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

const refill2 = new Scene('refill2')
refill2.question = (ctx) => {
  ctx.echo('Укажите сумму');
}
refill2.answer = (ctx, session) => {
  ctx.push((input) => {
    const token = session.get('token')
    const market = session.get('market')
    const value = Number(input)
    if (value > token.balance) {
      ctx.echo('У вас не достаточно средств');
    } else if (value > token.approve) {
      ctx.loader();
      utils.approve(value)
        .then((txId) => {
          ctx.load('Отправленна транзакция на approve. tx: ' + txId);
          ctx.loader();
          return hett().watcher.addTx(txId)
        })
        .then((transaction) => {
          ctx.load('Approve выполнен');
          ctx.echo('blockNumber: ' + transaction.blockNumber);
          ctx.echo('Выполняется перевод средств', true);
          ctx.loader();
          return controls.getModelByMarketIndex(market)
        })
        .then(model => utils.refill(model, value))
        .then((txId) => {
          ctx.load('Отправленна транзакция на перевод. tx: ' + txId);
          ctx.loader();
          return hett().watcher.addTx(txId)
        })
        .then((transaction) => {
          ctx.load('blockNumber: ' + transaction.blockNumber);
          ctx.echo('Ваши средства переведены');
          ctx.pop();
        })
        .catch((e) => {
          ctx.load(e.toString() + '\n\n');
          ctx.pop();
        })
    } else {
      ctx.loader();
      controls.getModelByMarketIndex(market)
        .then(model => utils.refill(model, value))
        .then((txId) => {
          ctx.load('Отправленна транзакция на перевод. tx: ' + txId);
          ctx.loader();
          return hett().watcher.addTx(txId)
        })
        .then((transaction) => {
          ctx.load('blockNumber: ' + transaction.blockNumber);
          ctx.echo('Ваши средства переведены');
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

export default new Wizard('refill', new Session(), [refill1, refill2])
