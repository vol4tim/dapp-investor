import _ from 'lodash'
import { hett } from 'hett'
import { USER_FUND } from '../../config/config'
import { controls, utils } from '../../aira'
import { Scene, Wizard, Session } from '../../utils/scenes'

const market1 = new Scene('market1')
market1.question = (ctx, session) => {
  ctx.loader();
  return controls.marketsStat()
    .then((result) => {
      session.set('markets', result)
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
      ctx.load(message);
    })
    .catch((e) => {
      ctx.load(e.toString() + '\n\n');
      return false
    })
}
market1.answer = (ctx, session) => {
  ctx.push((input) => {
    const index = Number(input) - 1
    session.set('market', index)
    if (_.has(session.get('markets'), index)) {
      ctx.loader();
      controls.distributionFactory({ index, amount: USER_FUND })
        .then((result) => {
          let message = ''
          _.forEach(result, (item, i) => {
            if (i === index) {
              message += 'Оценка ваших действий: ' + item.robots + ' из 4 умных фабрик будут участвовать в производстве "' + item.name + '", если другие инвесторы не изменят свою стратегию.'
            }
          })
          message += '\n\n'
          ctx.load(message);
          ctx.pop();
          ctx.nextScene()
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

const market2 = new Scene('market2')
market2.question = (ctx) => {
  ctx.echo('Для начала игры введите команду "game"')
}
market2.answer = (ctx, session) => {
  ctx.push((input) => {
    if (input.toLowerCase() === 'game') {
      ctx.loader();
      controls.getUtility()
        .then((result) => {
          ctx.load('У вас на балансе ' + result.balance + ' ' + result.symbol + '. Доступно ' + result.approve + ' ' + result.symbol + '.');
          if (result.balance <= 0) {
            ctx.echo('У вас не достаточно средств');
            ctx.pop();
          } else {
            session.set('token', result)
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

const market3 = new Scene('market3')
market3.question = (ctx) => {
  ctx.echo(`Отправить транзакцию?
y - Yes
n - No`)
}
market3.answer = (ctx, session) => {
  ctx.push((input) => {
    if (input.toLowerCase() === 'y' || input.toLowerCase() === 'yes') {
      const market = Number(session.get('market'))
      const value = USER_FUND
      if (value > session.get('token').balance) {
        ctx.echo('У вас не достаточно средств');
        ctx.pop();
      } else if (value > session.get('token').approve) {
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
            return controls.getModelByMarketIndex(market)
          })
          .then(model => utils.refill(model, value))
          .then((txId) => {
            ctx.echo('Отправленна транзакция на перевод. tx: ' + txId);
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
    } else if (input.toLowerCase() === 'n' || input.toLowerCase() === 'no') {
      ctx.pop();
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

export default new Wizard('market', new Session(), [market1, market2, market3])
