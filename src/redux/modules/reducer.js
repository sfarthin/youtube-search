import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-async-connect';

import info from './info';
import favorites from './favorites';

export default combineReducers({
  routing: routerReducer,
  reduxAsyncConnect,
  info,
  favorites
});
