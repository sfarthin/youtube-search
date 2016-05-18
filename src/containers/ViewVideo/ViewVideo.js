import React, { Component, PropTypes } from 'react';
import { asyncConnect } from 'redux-async-connect';
import { connect } from 'react-redux';
import { find, includes } from 'lodash';
import { details as youTubeDetails } from 'redux/modules/youtube';
import { add as addToFavorites, remove as removeFromFavorites } from 'redux/modules/favorites';

import { VideoDetailsBody, Comments } from 'components';

function findVideoFromSearch(state, videoid) {
  return state.youtube && state.youtube.result && find(state.youtube.result.items, (i) => i.id.videoId === videoid);
}

@asyncConnect([{
  promise: ({params, store: {dispatch, getState}}) => {
    // If we do not have at least a snippet from the search results, then load the details before showing.
    const state = getState();
    const video = findVideoFromSearch(state, params.videoid);
    const stats = state.youtube.stats && state.youtube.stats[params.videoid];
    if (!video || !stats) {
      return dispatch(youTubeDetails([params.videoid]));
    }
  }
}])
@connect(
  function(state, props) {
    // We prefer the full details from a details request
    const videoFromDetails = state.youtube.details && find(state.youtube.details.items, (i) => i.id === props.params.videoid);
    if (videoFromDetails) {
      return {
        video: videoFromDetails,
        stats: videoFromDetails.statistics,
        favorites: state.favorites.data
      };
    }
    // Try from search results as a backup
    const video = findVideoFromSearch(state, props.params.videoid);
    const stats = state.youtube.stats && state.youtube.stats[props.params.videoid];
    return {
      video: video,
      stats: stats,
      favorites: state.favorites.data,
      fromSearchResults: 1
    };
  },
  { youTubeDetails, addToFavorites, removeFromFavorites }
)
export default class ViewVideo extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    video: PropTypes.object.isRequired,
    stats: PropTypes.object.isRequired,
    favorites: PropTypes.array.isRequired,
    fromSearchResults: PropTypes.number
  }

  componentDidMount() {
    // If we used the data from search results, lets load the fuller details.
    if (this.props.fromSearchResults) {
      this.props.youTubeDetails([this.props.params.videoid]);
    }
  }
  //
  // addToFavorites() {
  //   this.props.addToFavorites(this.props.params.videoid);
  // }
  render() {
    const { video, stats, params, favorites } = this.props;
    const isFavorite = includes(favorites, params.videoid);

    const favoriteButton = <button className="btn btn-primary" onClick={() => this.props.addToFavorites(params.videoid)}><span className="fa fa-star" /> Add to Favorites</button>;
    const unFavoriteButton = <button className="btn btn-danger" onClick={() => this.props.removeFromFavorites(params.videoid)}><span className="fa fa-star" /> Remove from Favorites</button>;

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            <iframe width="560" height="315" src={'https://www.youtube.com/embed/' + params.videoid} frameBorder="0" allowFullScreen style={{ paddingBottom: 20, display: 'block', margin: 'auto'}} />
            <div style={{ display: 'block', width: 560, margin: 'auto', paddingBottom: 30 }}>
              <VideoDetailsBody video={video} stats={stats} videoid={params.videoid} embed={1} />
            </div>
          </div>
          <div className="col-md-4">
            <div style={{ maxWidth: 560, margin: 'auto' }}>
              { !isFavorite ? favoriteButton : unFavoriteButton }
              <div style={{paddingTop: 30}}>
                { stats.commentCount > 0 ? <Comments videoid={params.videoid} /> : <p>There are no comments for this video.</p> }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
