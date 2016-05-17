import API from '../utils/youtubeAPI.js';
const api = new API();

export function youTubeSearch(req) {
  return api.search(req.body);
}

export function youTubeStats(req) {
  return api.stats(req.body);
}

export function youTubeDetails(req) {
  return api.details(req.body);
}

export function youTubeComments(req) {
  return api.comments(req.body);
}
