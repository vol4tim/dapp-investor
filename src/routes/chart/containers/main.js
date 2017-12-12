import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import axios from 'axios'
import ReactHighcharts from 'react-highcharts'
import Base58 from 'base-58'
import Datetime from 'react-datetime'
import { Layout } from '../components/common'
import { URL_DATA_CHART } from '../../../config/config'

const web3Beta = new Web3();

function getConfig(market) {
  const series = _.values(market.series)

  const ask = _.find(series, { typeLine: 'ask' })
  const bids = _.filter(series, { typeLine: 'bid' })
  let intersect = []
  for (let i = 0; i < bids.length; i += 1) {
    intersect = _.concat(intersect, _.intersectionWith(ask.data, bids[i].data, _.isEqual))
  }

  series.push({
    name: 'Пересечения',
    color: '#cc1d1d',
    marker: {
      radius: 6,
      symbol: 'circle'
    },
    data: intersect,
    type: 'scatter'
  })

  const config = {
    chart: {
      marginLeft: 40,
      spacingTop: 20,
      spacingBottom: 20
    },
    title: {
      text: market.name,
      align: 'left',
      margin: 0,
      x: 30
    },
    credits: {
      enabled: false
    },
    yAxis: {
      title: {
        text: null
      }
    },
    legend: {
      layout: 'horizontal',
      verticalAlign: 'top'
    },
    tooltip: {
      // positioner: (x, y, p) => {
      //   console.log(x, y, p);
      //   return {
      //     x: 800, // this.chart.chartWidth - this.label.width,
      //     y: 10
      //   }
      // },
      borderWidth: 0,
      backgroundColor: 'none',
      pointFormat: '{point.x} / {point.y}',
      headerFormat: '',
      shadow: false
    },
    series
  }
  return config
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
  const account = web3Beta.eth.accounts.recover(hashMessage, signature);
  return account;
}

function loadData(date) {
  const merketsName = {
    QmX6ZRFhNdoCsdtjBfYsPJd3iKahW3Hijp2WMJs8pfXeWP: 'yellow',
    QmTnmssidmL3Kqabz3eECxDsXUbXdQEEqaBE1vvdmkc1xv: 'green',
    QmVLDAhCY3X9P2uRudKAryuQFPM5zqA3Yij1dY8FpGbL7T: 'blue',
    QmYcq3KNupcEq6bsS8gJraJdFN8XXRHi6R3tMYUyxLr5Dz: 'purple'
  }
  const merketsColor = {
    QmX6ZRFhNdoCsdtjBfYsPJd3iKahW3Hijp2WMJs8pfXeWP: '#e6d32f',
    QmTnmssidmL3Kqabz3eECxDsXUbXdQEEqaBE1vvdmkc1xv: '#abde9b',
    QmVLDAhCY3X9P2uRudKAryuQFPM5zqA3Yij1dY8FpGbL7T: '#7f81fb',
    QmYcq3KNupcEq6bsS8gJraJdFN8XXRHi6R3tMYUyxLr5Dz: '#de2fe6'
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

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {
      start: '',
      end: '',
      markets: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // componentWillMount() {
  //   loadData()
  //     .then((markets) => {
  //       this.setState({ markets });
  //     })
  // }

  handleChange(moment, name) {
    this.setState({ [name]: moment.format('DD.MM.YYYY') });
  }

  handleSubmit() {
    loadData(this.state.start + ' 00:00 - ' + this.state.end + ' 00:00')
      .then((markets) => {
        this.setState({ markets });
      })
  }

  render() {
    return (
      <Layout title="Визуализации игры Робономика">
        <div className="panel panel-default">
          <div className="panel-body">
            <form action="" method="get" className="form-inline">
              <div className="form-group">
                <Datetime dateFormat="DD.MM.YYYY" timeFormat={false} value={this.state.start} onChange={(moment) => { this.handleChange(moment, 'start') }} />
              </div>
              <div className="form-group">
                <Datetime dateFormat="DD.MM.YYYY" timeFormat={false} value={this.state.end} onChange={(moment) => { this.handleChange(moment, 'end') }} />
              </div>
              <button type="button" className="btn btn-default" onClick={this.handleSubmit}>Show</button>
            </form>
          </div>
        </div>
        {this.state.markets.map((market, index) => (
          <div key={index} style={{ width: '50%', float: 'left' }}>
            <ReactHighcharts config={getConfig(market)} />
          </div>
        ))}
      </Layout>
    )
  }
}

export default connect()(Container)
