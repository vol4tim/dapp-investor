import React, { Component } from 'react'
import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
import { Switch, Route, Redirect } from 'react-router-dom'

import * as Chart from '../../routes/chart'
import * as Terminal from '../../routes/terminal'
import NotFound from '../components/app/notFound'
import Load from '../components/app/load'
// import { load } from '../../modules/app/actions';

import './style.css'

class Bootstrap extends Component {
  componentWillMount() {
    // this.props.load();
  }

  render() {
    return (
      <Route render={() => {
        if (!this.props.isLoaded) {
          return <Load />
        }
        return (
          <Switch>
            <Redirect exact path="/" to="/terminal" />
            <Route path="/chart" component={Chart.Page} />
            <Route path="/terminal" component={Terminal.Page} />
            <Route component={NotFound} />
          </Switch>
        )
      }}
      />
    )
  }
}

function mapStateToProps(state) {
  return {
    isLoaded: true,
    settings: state.settings
  }
}
// function mapDispatchToProps(dispatch) {
//   const actions = bindActionCreators({
//     load
//   }, dispatch)
//   return {
//     load: actions.load
//   }
// }

export default connect(mapStateToProps, null)(Bootstrap)
