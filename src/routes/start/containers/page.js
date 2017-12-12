import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import * as Pages from '../index'

const Page = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={match.path} component={Pages.Join} />
      <Route path={`${match.path}/new`} component={Pages.New} />
      <Redirect to={`${match.url}`} />
    </Switch>
  </div>
)

export default Page
