import _ from 'lodash'
import axios from 'axios'
import Base58 from 'base-58'
import { URL_DATA_CHART, MARKETS } from '../../../../config/config'
import utils from '../../../../../web3_modules/web3-utils'
import ethAccounts from '../../../../../web3_modules/eth-lib/lib/account'

const web3Beta = {
  utils,
  ethAccounts
}

function getAccount(msg) {
  const data = web3Beta.utils.soliditySha3(
    { type: 'bytes', value: web3Beta.utils.bytesToHex(Base58.decode(msg.model)) },
    { type: 'uint256', value: msg.cost },
    { type: 'uint256', value: msg.count },
    { type: 'uint256', value: msg.fee },
    { type: 'bytes32', value: web3Beta.utils.bytesToHex(msg.salt) }
  );
  const hashMessage = web3Beta.utils.soliditySha3(
    { type: 'bytes', value: '0x19457468657265756d205369676e6564204d6573736167653a0a3332' },
    { type: 'bytes', value: data }
  );
  const signature = web3Beta.utils.bytesToHex(msg.signature)
  const account = web3Beta.ethAccounts.recover(hashMessage, signature);
  return account;
}

export function loadData(date) {
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
    '0xeb912041ac81e2dd8b707ed23f20cec6f4e21a95': 'Предложение 1',
    '0x5017217da734c9b51d5dada217e93e0a70e27a21': 'Предложение 2',
    '0xccc23de4d2d87ca9a694995fae40839f699f373e': 'Предложение 3',
    '0x66f96a5535151486768560dd31251133105381e0': 'Предложение 4'
  }

  const markets = []
  return axios.get(URL_DATA_CHART, {
    params: {
      date
    }
  })
    .then((result) => {
      const json = result.data
      for (let i = 0; i < json.length; i += 1) {
        if (json[i].topic === '/market/sending/bid' || json[i].topic === '/market/sending/ask') {
          let msg = '{' + json[i].msg + '}'
          msg = msg.replace(new RegExp(': ', 'g'), "': ")
          msg = msg.replace(new RegExp('objective', 'g'), "'objective")
          msg = msg.replace(new RegExp('cost', 'g'), "'cost")
          msg = msg.replace(new RegExp('count', 'g'), "'count")
          msg = msg.replace(new RegExp('fee', 'g'), "'fee")
          msg = msg.replace(new RegExp('salt', 'g'), "'salt")
          msg = msg.replace(new RegExp('signature', 'g'), "'signature")
          msg = msg.replace(new RegExp('{', 'g'), "{'")
          msg = msg.replace(new RegExp("'", 'g'), '"')
          msg = JSON.parse(msg)

          const account = getAccount(msg)

          const marketIndex = _.findIndex(markets, { name: merketsName[msg.model] });
          if (marketIndex >= 0) {
            if (json[i].topic === '/market/sending/bid') {
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
            } else if (json[i].topic === '/market/sending/ask') {
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
            if (json[i].topic === '/market/sending/bid') {
              series[account] = {
                name: accounts[account],
                typeLine: 'bid',
                data: [[msg.count, msg.cost]]
              }
            } else if (json[i].topic === '/market/sending/ask') {
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
      return markets
    })
}
