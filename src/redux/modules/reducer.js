import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-async-connect';

import favorites from './favorites';
import youtube from './youtube';

export default combineReducers({
  routing: routerReducer,
  reduxAsyncConnect,
  youtube,
  favorites
});
