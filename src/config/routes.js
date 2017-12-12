import React from 'react'
import { Switch, Route } from 'react-router-dom'
import * as Start from '../routes/start'
import BootstrapRoute from '../shared/containers/bootstrap'

const routes = () => (
  <Switch>
    <Route path="/start" component={Start.Page} />
    <BootstrapRoute path="/" />
  </Switch>
)

export default routes
