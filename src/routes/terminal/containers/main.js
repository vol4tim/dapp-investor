import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import Terminal from './terminal'
import { Layout } from '../components/common'
import { Scene, addScene, sendScene } from '../../../utils/scene'
import * as scenes from './scenes'
import { getMarketsFund, getMarkets, smartFactory } from './utils'

const addScenes = (terminalNode) => {
  addScene(new Scene('connect', scenes.connect, { terminal: terminalNode }));
  addScene(new Scene('chart', scenes.chart, { terminal: terminalNode }));
  addScene(new Scene('markets', scenes.markets, { terminal: terminalNode }));
  addScene(new Scene('refill', scenes.refillMarket, { terminal: terminalNode }));
}

const validCmd = {
  help: `commands:
    - connect
    - game
  `,
  game: `Для игры используейте следующие команды:
    - refill (Инвестировать)
    - fund (Распределение капитала по рынкам)
    - distribution (Распределение фабрик)
  `,
  distribution: () => {
    let markets = {}
    return getMarkets()
      .then((result) => {
        markets = result
        return getMarketsFund()
      })
      .then((marketsFund) => {
        const calcMarketsFund = marketsFund
        let marketsRobot = {
          0: 0,
          1: 0,
          2: 0,
          3: 0
        }
        let i = 0
        while (i < 4) {
          marketsRobot = smartFactory(calcMarketsFund, marketsRobot)
          i += 1
        }
        let message = ''
        _.forEach(markets, (item, index) => {
          message += (Number(index) + 1) + '. ' + item.name + '. В производстве будут учавствовать ' + marketsRobot[index] + ' умных фабрик\n'
        })
        return message
      })
  },
  connect: (params = '', step = false) => {
    if (!step) {
      sendScene('connect', 1);
    } else {
      sendScene('next', 1, { input: params });
    }
    return true;
  },
  chart: (params = '', step = false) => {
    if (!step) {
      sendScene('chart', 1);
    } else {
      sendScene('next', 1, { input: params });
    }
    return true;
  },
  markets: (params = '', step = false) => {
    if (!step) {
      sendScene('markets', 1);
    } else {
      sendScene('next', 1, { input: params });
    }
    return true;
  },
  refill: (params = '', step = false) => {
    if (!step) {
      sendScene('refill', 1);
    } else {
      sendScene('next', 1, { input: params });
    }
    return true;
  },
  fund: () => {
    let markets = {}
    return getMarkets()
      .then((result) => {
        markets = result
        return getMarketsFund()
      })
      .then((marketsFund) => {
        let message = ''
        _.forEach(markets, (item, i) => {
          message += '\n' + (Number(i) + 1) + '. ' + item.name + ' - ' + marketsFund[i] + ' XRT'
        })
        return message
      })
  },
}

const Container = () => (
  <Layout title="Визуализации игры Робономика">
    <Terminal
      startupMessages={[{
          content: `Сеть экономики роботов приветствует нового инвестора.
Меня зовут Aira, я есть представление умных фабрик, способных самостоятельно заключать контракты обязательств на производство рыночных товаров.
Чтобы начать выполните команду \`connect\``,
          type: 'message'
        }]}
      commands={validCmd}
      ref={(el) => { addScenes(el) }}
    />
  </Layout>
)

export default connect()(Container)
