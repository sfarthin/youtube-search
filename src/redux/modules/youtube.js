import { zipObject, map, clone } from 'lodash';

const SEARCH = 'youtube/SEARCH';
const SEARCH_SUCCESS = 'youtube/SEARCH_SUCCESS';
const SEARCH_FAIL = 'favorites/SEARCH_FAIL';

const DETAILS = 'youtube/DETAILS';
const DETAILS_SUCCESS = 'youtube/DETAILS_SUCCESS';
const DETAILS_FAIL = 'youtube/DETAILS_FAIL';

const STATS = 'youtube/STATS';
const STATS_SUCCESS = 'youtube/STATS_SUCCESS';
const STATS_FAIL = 'youtube/STATS_FAIL';

const COMMENTS = 'youtube/COMMENTS';
const COMMENTS_SUCCESS = 'youtube/COMMENTS_SUCCESS';
const COMMENTS_FAIL = 'youtube/COMMENTS_FAIL';

const MORECOMMENTS = 'youtube/MORECOMMENTS';
const MORECOMMENTS_SUCCESS = 'youtube/MORECOMMENTS_SUCCESS';
const MORECOMMENTS_FAIL = 'youtube/MORECOMMENTS_FAIL';

const initialState = {
  loaded: false
};

export default function youtube(state = initialState, action = {}) {
  switch (action.type) {
    case MORECOMMENTS_SUCCESS:
      const mComments = clone(state.moreComments);
      mComments[action.result.pageToken] = action.result;
      return {
        ...state,
        moreComments: mComments
      };
    case COMMENTS:
      return {
        ...state,
        comments: null,
        moreComments: {}
      };
    case COMMENTS_SUCCESS:
      return {
        ...state,
        comments: action.result
      };
    case COMMENTS_FAIL:
      return {
        ...state,
        comments: null
      };
    case STATS_SUCCESS:
      const keys = map(action.result.items, (i) => i.id);
      const values = map(action.result.items, (i) => i.statistics);
      return {
        ...state,
        stats: zipObject(keys, values)
      };
    case DETAILS_SUCCESS:
      return {
        ...state,
        details: action.result
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
    // Get the search results.
    const result = await dispatch({
      types: [ SEARCH, SEARCH_SUCCESS, SEARCH_FAIL],
      promise: (client) => client.post('/youTubeSearch', {data: opts})
    });

    // Get a list of ids for the search results shown.
    const ids = map(result.items, (i) => i.id.videoId);

    // Lets automatically get the stats for these search results.
    return await dispatch({
      types: [ STATS, STATS_SUCCESS, STATS_FAIL],
      promise: (client) => client.post('/youTubeStats', {data: ids})
    });
  };
}

export function details(ids) {
  return {
    types: [ DETAILS, DETAILS_SUCCESS, DETAILS_FAIL ],
    promise: (client) => client.post('/youTubeDetails', {data: {ids: ids}})
  };
}

export function comments(id) {
  return {
    types: [ COMMENTS, COMMENTS_SUCCESS, COMMENTS_FAIL ],
    promise: (client) => client.post('/youTubeComments', {data: {id: id}})
  };
}

export function moreComments(id, pageToken) {
  return {
    types: [ MORECOMMENTS, MORECOMMENTS_SUCCESS, MORECOMMENTS_FAIL ],
    promise: (client) => client.post('/youTubeComments', {data: {id: id, pageToken: pageToken}})
  };
}
