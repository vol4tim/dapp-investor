import { controls } from '../../aira'
import { Scene } from '../../utils/scenes'

const income = new Scene('income')
income.question = (ctx) => {
  ctx.echo(`Ваш доход
1 - Последний период
2 - За все время`)
}
income.answer = (ctx) => {
  ctx.push((input) => {
    if (Number(input) === 1 || Number(input) === 2) {
      const type = (Number(input) === 2) ? 'full' : 'last'
      ctx.loader();
      controls.getIncome(type)
        .then((result) => {
          ctx.load('Ваш доход: ' + result);
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

export default income
