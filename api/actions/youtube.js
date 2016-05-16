import API from '../utils/youtubeAPI.js';
const api = new API();

export function youTubeSearch(req) {
  return api.search(req.body);
}

export function youTubeStats(req) {
  return api.stats(req.body);
}
