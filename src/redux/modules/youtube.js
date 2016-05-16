import { zipObject, map } from 'lodash';

const SEARCH = 'youtube/SEARCH';
const SEARCH_SUCCESS = 'youtube/SEARCH_SUCCESS';
const SEARCH_FAIL = 'favorites/SEARCH_FAIL';

const DETAILS = 'youtube/DETAILS';
const DETAILS_SUCCESS = 'youtube/DETAILS_SUCCESS';
const DETAILS_FAIL = 'youtube/DETAILS_FAIL';

const initialState = {
  loaded: false
};

export default function youtube(state = initialState, action = {}) {
  switch (action.type) {
    case DETAILS_SUCCESS:
      const keys = map(action.result.items, (i) => i.id);
      const values = map(action.result.items, (i) => i.statistics);
      return {
        ...state,
        stats: zipObject(keys, values)
      };
    case SEARCH:
      return {
        ...state,
        searching: true,
        result: null,
        stats: null
      };
    case SEARCH_SUCCESS:
      return {
        ...state,
        searching: false,
        result: action.result
      };
    case SEARCH_FAIL:
      return {
        ...state,
        searching: false,
        error: true
      };
    default:
      return state;
  }
}

export function search(opts) {
  return async (dispatch) => {
    console.log(opts);
    // Get the search results.
    const result = await dispatch({
      types: [ SEARCH, SEARCH_SUCCESS, SEARCH_FAIL],
      promise: (client) => client.post('/youTubeSearch', {data: opts})
    });

    // Get a list of ids for the search results shown.
    const ids = map(result.items, (i) => i.id.videoId);

    // Lets automatically get the stats for these search results.
    return await dispatch({
      types: [ DETAILS, DETAILS_SUCCESS, DETAILS_FAIL],
      promise: (client) => client.post('/youTubeStats', {data: ids})
    });
  };
}
