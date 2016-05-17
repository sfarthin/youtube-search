import queryString from 'query-string';
import request from 'superagent';
import { extend, filter } from 'lodash';
import promisify from 'es6-promisify';
import moment from 'moment';

const API_KEY = 'AIzaSyCWDpnGOueheazoTOhbH_26btkZ9MImHPU';

class SimpleCache {

  static cacheHours = 1

  // constructor may take a prefix
  constructor() {
    this.cache = {};
  }

  get(key, cb) {
    // Lets remove any old entries
    this.cache = filter(this.cache, (e) => moment(e.date) > moment().subtract(cacheHours, "hour"));

    // Return a cached entry if its less than an hour.
    cb(this.cache[key] && this.cache[key].val);
  }

  set(key, val) {
    this.cache[key] = {
      date: new Date(),
      val: val
    };
  }
}

export default class API {
    constructor(Cache = SimpleCache) {
      this.searchCache = new Cache('search');
      this.statsCache = new Cache('stats');
      this.detailsCache = new Cache('details');
      this.commentsCache = new Cache('comments');
    }

    makeSearchUrl(opts) {
      const payload = { q: opts.q, part: 'snippet', key: API_KEY, pageToken: opts.pageToken, order: opts.order || 'date', type: 'video' };
      return 'https://www.googleapis.com/youtube/v3/search?' + queryString.stringify(payload);
    }

    makeStatisticsUrl(ids) {
      const payload = { id: ids.join(','), part: 'statistics', key: API_KEY };
      return 'https://www.googleapis.com/youtube/v3/videos?' + queryString.stringify(payload);
    }

    makeCommentsUrl(opts) {
      const payload = { videoId: opts.id, pageToken: opts.pageToken, part: 'snippet,replies', key: API_KEY };
      return 'https://www.googleapis.com/youtube/v3/commentThreads?' + queryString.stringify(payload);
    }

    // makeCommentThreadsUrl(opts) {
    //   const payload = { videoId: opts.id, part: 'snippet,replies', key: API_KEY };
    //   return 'https://www.googleapis.com/youtube/v3/commentThreads?' + queryString.stringify(payload);
    // }

    makeDetailsUrl(opts) {
      const payload = { id: opts.ids.join(","), part: 'snippet,statistics', key: API_KEY };
      return 'https://www.googleapis.com/youtube/v3/videos?' + queryString.stringify(payload);
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

    details(opts) {
      return promisify(this.fetch)(this.makeDetailsUrl(opts), this.detailsCache, opts);
    }

    comments(opts) {
      return promisify(this.fetch)(this.makeCommentsUrl(opts), this.detailsCache, opts);
    }
}
