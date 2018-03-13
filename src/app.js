import React from 'react'
import { render } from 'react-dom'
import Terminal from './components/terminal'

export default () => {
  render(
    <Terminal />
    ,
    document.getElementById('root')
  )
}
