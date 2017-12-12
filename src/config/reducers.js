import { combineReducers } from 'redux'
import * as modules from '../modules/reducers';

export default combineReducers({
  ...modules,
})
