import React from 'react'
import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'

import Header from '../components/app/header'
import Footer from '../components/app/footer'
// import { flashMessage, setLanguage } from '../../modules/app/actions';

const Layout = props => (
  <div>
    <Header
      title={props.title}
    />
    <div className="container" id="maincontainer">
      <div className="row">
        <div className="col-md-12" style={{ borderLeft: '1px solid #eee' }}>
          {props.children}
        </div>
      </div>
    </div>
    <Footer />
  </div>
)

function mapStateToProps(state) {
  return {
    title: state.app.title
  }
}
// function mapDispatchToProps(dispatch) {
//   const actions = bindActionCreators({
//     flashMessage,
//     setLanguage,
//   }, dispatch)
//   return {
//     flashMessage: actions.flashMessage,
//     setLanguage: actions.setLanguage,
//   }
// }

export default connect(mapStateToProps)(Layout)
