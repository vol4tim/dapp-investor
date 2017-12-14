import _ from 'lodash'
import axios from 'axios'
import Base58 from 'base-58'
import { URL_DATA_CHART } from '../../../../config/config'
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
  const merketsName = {
    QmWboFP8XeBtFMbNYK3Ne8Z3gKFBSR5iQzkKgeNgQz3dz4: 'Роботы для медицины',
    QmbnPpVAA2c5Fsfuo4D4VhwY5YfNe2o5P6KZnYjw47ebQT: 'Роботы для металлургии',
    QmZky14ya2BbSNmjkrybxGdADTg7w7r4rKrVcotsz16HvP: 'Роботы для автомобилестроения',
    QmfM63vD3hpDHFSikoRFxucyEgKb7FERcXvLDKpGXnWWh8: 'Роботы для производства электроники'
  }
  const merketsColor = {
    QmWboFP8XeBtFMbNYK3Ne8Z3gKFBSR5iQzkKgeNgQz3dz4: '#e6d32f',
    QmbnPpVAA2c5Fsfuo4D4VhwY5YfNe2o5P6KZnYjw47ebQT: '#abde9b',
    QmZky14ya2BbSNmjkrybxGdADTg7w7r4rKrVcotsz16HvP: '#7f81fb',
    QmfM63vD3hpDHFSikoRFxucyEgKb7FERcXvLDKpGXnWWh8: '#de2fe6'
  }
  const accounts = {
    '0x00C40c00BFbdf3956eEfF267736DaF8f1203330f': 'Предложение 1',
    '0x00d4E36981c631dB44714416075978d721aD5eF0': 'Предложение 2',
    '0x00d636053Dea4d00B0165eBcAD5eA283Fbf48FA1': 'Предложение 3',
    '0x008284E1D9582AAD15dDd9390216B3a0445D1474': 'Предложение 4'
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
