import _ from 'lodash'
import { controls } from '../../aira'
import { Scene } from '../../utils/scenes'

const top = new Scene('top')
top.question = (ctx) => {
  ctx.echo(`Топ инвесторов
1 - Последний период
2 - За все время`)
}
top.answer = (ctx) => {
  ctx.push((input) => {
    if (Number(input) === 1 || Number(input) === 2) {
      const type = (Number(input) === 2) ? 'full' : 'last'
      ctx.loader();
      controls.getTop(type)
        .then((result) => {
          let message = ''
          _.forEach(result, (item, i) => {
            message += (i + 1) + '. ' + item.account + ': ' + item.fund + '\n'
          })
          ctx.load(message);
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

export default top
