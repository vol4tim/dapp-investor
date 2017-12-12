import React from 'react'

const Layout = props => (
  <div className="container">
    <div className="row">
      <div className="col-md-6 col-md-offset-3" style={{ marginTop: 50 }}>
        <div className="panel panel-default">
          <div className="panel-heading" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20 }}>
            <i className="fa fa-university" /> {props.title}
          </div>
          <div className="panel-body" style={{ textAlign: 'center' }}>
            {props.children}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default Layout
