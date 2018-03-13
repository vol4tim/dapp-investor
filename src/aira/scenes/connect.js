import React from 'react'
import Table from '../../components/table'
import { controls } from '../../aira'
import { Scene } from '../../utils/scenes'

const connect = new Scene('connect')
connect.question = (ctx) => {
  ctx.echo(`Хотите посмотреть текущую доходность роботизированных рынков?
y - Yes
n - No`)
}
connect.answer = (ctx) => {
  ctx.push((input) => {
    if (input.toLowerCase() === 'y' || input.toLowerCase() === 'yes') {
      ctx.loader();
      controls.marketsInfo()
        .then((data) => {
          ctx.load('Данные за последние ≈ 24 часа');
          ctx.component(<Table data={data} />)
          ctx.pop();
          ctx.exec('chart');
        })
        .catch((e) => {
          ctx.load(e.toString() + '\n\n');
          ctx.pop();
          ctx.exec('chart');
        })
    } else if (input.toLowerCase() === 'n' || input.toLowerCase() === 'no') {
      ctx.pop();
      ctx.exec('chart');
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

export default connect
