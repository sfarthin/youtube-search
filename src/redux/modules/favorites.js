import { union, filter } from 'lodash';

const LOAD = 'favorites/LOAD';
const LOAD_SUCCESS = 'favorites/LOAD_SUCCESS';
const LOAD_FAIL = 'favorites/LOAD_FAIL';

const ADD = 'favorites/ADD';
const ADD_SUCCESS = 'favorites/ADD_SUCCESS';
const ADD_FAIL = 'favorites/ADD_FAIL';

const REMOVE = 'favorites/REMOVE';
const REMOVE_SUCCESS = 'favorites/REMOVE_SUCCESS';
const REMOVE_FAIL = 'favorites/REMOVE_FAIL';

const initialState = {
  loaded: false
};

export default function favorites(state = initialState, action = {}) {
  switch (action.type) {
    case 'REALTIME_FAVORITES_UPDATE':
      return {
        ...state,
        loading: false,
        data: action.result
      };
    case ADD:
      return {
        ...state,
        data: union(state.data, [action.favorite])
      };
    case REMOVE:
      return {
        ...state,
        data: filter(state.data, (f) => f !== action.favorite)
      };
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.favorites && globalState.favorites.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/loadFavorites')
  };
}

export function add(favorite) {
  return {
    favorite: favorite,
    types: [ ADD, ADD_SUCCESS, ADD_FAIL ],
    promise: (client) => client.post('/addFavorite', {data: {favorite}})
  };
}

export function remove(favorite) {
  return {
    favorite: favorite,
    types: [ REMOVE, REMOVE_SUCCESS, REMOVE_FAIL ],
    promise: (client) => client.post('/removeFavorite', {data: {favorite}})
  };
}
