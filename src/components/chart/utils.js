import _ from 'lodash'
import axios from 'axios'
import Base58 from 'base-58'
import { URL_DATA_CHART, MARKETS } from '../../config/config'
import web3Beta from '../../utils/web3Beta'

function getAccount(msg) {
  let data = ''
  if (_.has(msg, 'objective')) {
    data = web3Beta.utils.soliditySha3(
      { type: 'bytes', value: web3Beta.utils.bytesToHex(Base58.decode(msg.model)) },
      { type: 'bytes', value: web3Beta.utils.bytesToHex(Base58.decode(msg.objective)) },
      { type: 'uint256', value: msg.cost },
      { type: 'uint256', value: msg.count },
      { type: 'uint256', value: msg.fee },
      { type: 'bytes32', value: web3Beta.utils.bytesToHex(msg.salt) }
    );
  } else {
    data = web3Beta.utils.soliditySha3(
      { type: 'bytes', value: web3Beta.utils.bytesToHex(Base58.decode(msg.model)) },
      { type: 'uint256', value: msg.cost },
      { type: 'uint256', value: msg.count },
      { type: 'uint256', value: msg.fee },
      { type: 'bytes32', value: web3Beta.utils.bytesToHex(msg.salt) }
    );
  }
  const hashMessage = web3Beta.utils.soliditySha3(
    { type: 'bytes', value: '0x19457468657265756d205369676e6564204d6573736167653a0a3332' },
    { type: 'bytes', value: data }
  );
  const signature = web3Beta.utils.bytesToHex(msg.signature)
  const account = web3Beta.ethAccounts.recover(hashMessage, signature);
  return _.toLower(account);
}

export function loadData(dateStart, dateEnd) {
  let merketsName = {}
  _.forEach(MARKETS, (item) => {
    merketsName = _.set(merketsName, item.model, item.name);
  })
  const colors = {
    0: '#e6d32f',
    1: '#abde9b',
    2: '#7f81fb',
    3: '#de2fe6'
  }
  let merketsColor = {}
  _.forEach(MARKETS, (item, i) => {
    merketsColor = _.set(merketsColor, item.model, colors[i]);
  })
  const accounts = {
    // '0x4f627C75c590ED6e337d8aaf6704884375b35cE4': 'Предложение 11',
    '0x27eddd316c8a9bfed82e7d271c87922abb0c153c': 'Предложение 0',
    '0xeb912041ac81e2dd8b707ed23f20cec6f4e21a95': 'Предложение 1',
    '0x5017217da734c9b51d5dada217e93e0a70e27a21': 'Предложение 2',
    '0xccc23de4d2d87ca9a694995fae40839f699f373e': 'Предложение 3',
    '0x66f96a5535151486768560dd31251133105381e0': 'Предложение 4'
  }

  const markets = []
  return axios.get(URL_DATA_CHART + 'api/v0/bag/' + dateStart + '/' + dateEnd)
    .then((result) => {
      // const topic = '/market/sending/'
      const topic = '/matcher/market/incoming/'
      const json = result.data
      for (let i = 0; i < json.length; i += 1) {
        if (json[i].topic === topic + 'bid' || json[i].topic === topic + 'ask') {
          const { msg } = json[i]
          // console.log(msg);
          if (msg.model !== '' && msg.count > 0 && msg.cost && _.has(merketsName, msg.model)) {
            const account = getAccount(msg)
            // console.log(account);
            if (_.has(accounts, account)) {
              const marketIndex = _.findIndex(markets, { name: merketsName[msg.model] });
              if (marketIndex >= 0) {
                if (json[i].topic === topic + 'bid') {
                  if (_.has(markets[marketIndex].series, account)) {
                    markets[marketIndex].series[account].data.push([msg.count, msg.cost])
                  } else {
                    markets[marketIndex].series[account] = {
                      name: accounts[account],
                      typeLine: 'bid',
                      data: []
                    }
                    markets[marketIndex].series[account].data.push([msg.count, msg.cost])
                  }
                } else if (json[i].topic === topic + 'ask') {
                  if (_.has(markets[marketIndex].series, 'ask')) {
                    markets[marketIndex].series.ask.data.push([msg.count, msg.cost])
                  } else {
                    markets[marketIndex].series.ask = {
                      name: 'Спрос',
                      typeLine: 'ask',
                      data: []
                    }
                    markets[marketIndex].series.ask.data.push([msg.count, msg.cost])
                  }
                }
              } else {
                const series = {}
                if (json[i].topic === topic + 'bid') {
                  series[account] = {
                    name: accounts[account],
                    typeLine: 'bid',
                    data: [[msg.count, msg.cost]]
                  }
                } else if (json[i].topic === topic + 'ask') {
                  series.ask = {
                    name: 'Спрос',
                    typeLine: 'ask',
                    color: merketsColor[msg.model],
                    data: [[msg.count, msg.cost]]
                  }
                }
                markets.push({
                  name: merketsName[msg.model],
                  series
                })
              }
            }
          }
        }
      }
      return markets
    })
}
