import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';
import { connect } from 'react-redux';
import { map, find, size, every, includes, compact, filter } from 'lodash';
import { details as youTubeDetails } from 'redux/modules/youtube';
import { loadFull as loadFavoritesAndData } from 'redux/modules/favorites';

import { VideoDetails } from 'components';

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const state = getState();
    if (!state.favorites.loaded) {
      return dispatch(loadFavoritesAndData());
    }
    const favorites = state.favorites.data;
    const loadedVideos = map(state.youtube.videosLoaded, (i) => i.id);
    const allFavoritesLoaded = every(favorites, (f) => includes(loadedVideos, f));
    if (!allFavoritesLoaded) {
      return dispatch(youTubeDetails(favorites));
    }
  }
}])
@connect(
  function(state) {
    const videosLoaded = state.youtube.videosLoaded;
    const favorites = map(state.favorites.data, (id) => find(videosLoaded, (v) => v.id === id));
    const videosNeedingLoaded = filter(state.favorites.data, (id) => !find(videosLoaded, (v) => v.id === id));
    return { favorites, videosNeedingLoaded };
  },
  { youTubeDetails }
)
export default class Favorites extends Component {
  static propTypes = {
    favorites: PropTypes.array.isRequired,
    youTubeDetails: PropTypes.func.isRequired,
    videosNeedingLoaded: PropTypes.array.isRequired
  }

  // If a new favorite is made in another window, lets make sure we can load it.
  componentDidUpdate() {
    if (size(this.props.videosNeedingLoaded)) {
      this.props.youTubeDetails(this.props.videosNeedingLoaded);
    }
  }
  render() {
    const styles = require('./Favorites.scss');
    const { favorites } = this.props;
    let videoList = null;
    if (size(favorites)) {
      videoList = (
        <ul className="media-list" style={{ clear: 'both', paddingTop: 30 }}>
         { map(compact(favorites), (video) => <VideoDetails video={video} stats={video.statistics} videoid={video.id} key={video.id} />) }
        </ul>
       );
    } else {
      videoList = <p>No videos have been marked as favorite.</p>;
    }

    return (
      <div className={styles.favoritesPage + ' container'}>
        <Helmet title="Favorite Videos" />
        <h1>Favorites</h1>
        <hr />
        { videoList }
      </div>
    );
  }
}
