import React from 'react'

const Layout = props => (
  <div className="container-fluid">
    <div className="starter-template">
      <h1>{props.title}</h1>
      {props.children}
    </div>
  </div>
)

export default Layout
