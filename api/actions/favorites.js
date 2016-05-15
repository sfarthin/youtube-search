export default function loadFavorites() {
  return new Promise((resolve) => {
    // req.session.user
    resolve([ "monkey", "bear", "gorrilla"]);
  });
}
