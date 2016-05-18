import redis from '../utils/redis';
import { union, filter } from 'lodash';

const redisKey = 'favorites';

// Helper Methods
function get(userid) {
  return redis.hgetAsync(redisKey, userid).then((obj) => (obj ? JSON.parse(obj) : []));
}

function add(userid, favorite) {
  return get(userid).then(function(arr) {
    const newArr = union(arr, [favorite]);
    return redis.hsetAsync(redisKey, userid, JSON.stringify(newArr)).then(() => newArr);
  });
}

function remove(userid, favorite) {
  return get(userid).then(function(arr) {
    const newArr = filter(arr, (f) => f !== favorite);
    return redis.hsetAsync(redisKey, userid, JSON.stringify(newArr)).then(() => newArr);
  });
}

function emitUpdate(req) {
  return function(res) {
    req.io.to(req.sessionID).emit('realtime', res);
    return res;
  };
}

// Exports
export function loadFavorites(req) {
  return get(req.sessionID);
}

export function addFavorite(req) {
  return add(req.sessionID, req.body.favorite).then(emitUpdate(req));
}

export function removeFavorite(req) {
  return remove(req.sessionID, req.body.favorite).then(emitUpdate(req));
}
