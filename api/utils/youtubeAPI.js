import queryString from 'query-string';
import request from 'superagent';
import { extend } from 'lodash';
import promisify from 'es6-promisify';

const API_KEY = 'AIzaSyCWDpnGOueheazoTOhbH_26btkZ9MImHPU';

class SimpleCache {

  // constructor may take a prefix
  constructor() {
    this.cache = {};
  }

  get(key, cb) {
    cb(this.cache[key]);
  }

  set(key, val) {
    this.cache[key] = val;
  }
}

export default class API {
    constructor(Cache = SimpleCache) {
      this.searchCache = new Cache('search');
      this.statsCache = new Cache('stats');
    }

    makeSearchUrl(opts) {
      const payload = {
        q: opts.q,
        part: 'snippet',
        key: API_KEY,
        order: opts.order || 'date',
        type: 'video'
      };
      return 'https://www.googleapis.com/youtube/v3/search?' + queryString.stringify(payload);
    }

    makeStatisticsUrl(ids) {
      const payload = {
        id: ids.join(','),
        part: 'statistics',
        key: API_KEY
      };
      return 'https://www.googleapis.com/youtube/v3/videos?' + queryString.stringify(payload);
    }

    makeCommentUrl(videoId) {
      const payload = {
        videoId: videoId,
        part: 'replies', // ,statistics
        key: API_KEY
      };
      return 'https://www.googleapis.com/youtube/v3/commentThreads?' + queryString.stringify(payload);
    }

    fetch(url, cache, query, cb) {
      cache.get(url, function(cachedResult) {
        if (cachedResult) {
          cb(null, cachedResult);
        } else {
          request.get(url).set('Referer', 'http://localhost:3000/').end(function(err, result) {
            const item = extend({url: url}, result.body, query);
            cb(err, item);
            cache.set(url, item);
          });
        }
      });
    }

    isSearchLoaded(query, youtube) {
      return !query || !query.q || (youtube && youtube.result && youtube.result.url === this.makeSearchUrl(query));
    }

    search(query) {
      return promisify(this.fetch)(this.makeSearchUrl(query), this.searchCache, query);
    }

    stats(opts) {
      return promisify(this.fetch)(this.makeStatisticsUrl(opts), this.statsCache, opts);
    }
}
