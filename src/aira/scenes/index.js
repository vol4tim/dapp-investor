import { Scenes } from '../../utils/scenes'
import connect from './connect'
import chart from './chart'
import market from './market'
import refill from './refill'
import income from './income'
import top from './top'

export default new Scenes([connect, chart, market, refill, income, top])
