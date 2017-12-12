import React from 'react'
import _ from 'lodash'
import ReactHighcharts from 'react-highcharts'

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
      // verticalAlign: 'top'
    },
    tooltip: {
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

const Main = props => (
  <div style={{ overflow: 'hidden' }}>
    {props.markets.map((market, index) => (
      <div key={index} style={{ width: '50%', float: 'left' }}>
        <ReactHighcharts config={getConfig(market)} />
      </div>
    ))}
  </div>
)

export default Main
