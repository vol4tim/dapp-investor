import React from 'react'
import moment from 'moment'
import Chart, { loadData as loadDataChart } from '../../components/chart'
import { Scene } from '../../utils/scenes'

const chart = new Scene('chart')
chart.question = (ctx) => {
  ctx.echo(`Показать графики спроса и предложения для данных рынков за вчерашний день?
y - Yes
n - No`)
}
chart.answer = (ctx) => {
  ctx.push((input) => {
    if (input.toLowerCase() === 'y' || input.toLowerCase() === 'yes') {
      ctx.loader();
      // const startdate = moment('2018-03-03');
      // const startdate = moment('2018-03-13');
      const startdate = moment();
      // startdate.subtract(1, 'days');
      // startdate.startOf('week').format('DD-MM-YYYY');
      // startdate.endOf('week');
      // console.log(startdate.format('DD-MM-YYYY'));
      loadDataChart(startdate.subtract(1, 'days').format('YYYY-MM-DD'), startdate.format('YYYY-MM-DD'))
        .then((markets) => {
          console.log(markets);
          if (markets.length <= 0) {
            throw new Error('Данные для графика отсутствуют')
          }
          ctx.load('Данные за последние ≈ 24 часа');
          ctx.component(<Chart markets={markets} />);
          ctx.pop();
          ctx.exec('market');
        })
        .catch((e) => {
          ctx.load(e.toString() + '\n\n');
          ctx.pop();
          ctx.exec('market');
        })
    } else if (input.toLowerCase() === 'n' || input.toLowerCase() === 'no') {
      ctx.pop();
      ctx.exec('market');
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

export default chart
