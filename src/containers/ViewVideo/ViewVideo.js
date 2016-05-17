import React, { Component, PropTypes } from 'react';
import { asyncConnect } from 'redux-async-connect';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { details as youTubeDetails, comments as youTubeComments } from 'redux/modules/youtube';

import { VideoDetailsBody } from 'components';

function findVideoFromSearch(state, videoid) {
  return state.youtube && state.youtube.result && find(state.youtube.result.items, (i) => i.id.videoId === videoid);
}

@asyncConnect([{
  promise: ({params, store: {dispatch, getState}}) => {
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
        commentsLoading: state.youtube.commentsLoading,
        comments: state.youtube.comments
      };
    }
    // Try from search results as a backup
    const video = findVideoFromSearch(state, props.params.videoid);
    const stats = state.youtube.stats && state.youtube.stats[props.params.videoid];
    return {
      video: video,
      stats: stats,
      commentsLoading: state.youtube.commentsLoading,
      comments: state.youtube.comments,
      fromSearchResults: 1
    };
  },
  { youTubeDetails, youTubeComments }
)
export default class ViewVideo extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    video: PropTypes.object.isRequired,
    stats: PropTypes.object.isRequired,
    comments: PropTypes.object,
    fromSearchResults: PropTypes.number
  }

  componentDidMount() {
    // If we used the data from search results, lets load the fuller details.
    if (this.props.fromSearchResults) {
      this.props.youTubeDetails([this.props.params.videoid]);
    }

    // Lets grab the comments
    this.props.youTubeComments(this.props.params.videoid);
  }

  render() {
    const { video, stats, params } = this.props;
    console.log('fromSearchResults', this.props.fromSearchResults, this.props.comments);
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            <iframe width="560" height="315" src={'https://www.youtube.com/embed/' + params.videoid} frameBorder="0" allowFullScreen style={{ paddingBottom: 20, display: 'block', margin: 'auto'}} />
            <div style={{ display: 'block', width: 560, margin: 'auto', paddingBottom: 30 }}>
              <VideoDetailsBody video={video} stats={stats} videoid={video.id} embed={1} />
            </div>
          </div>
          <div className="col-md-4">
            <div style={{ maxWidth: 560, margin: 'auto' }}>
              <p>comments</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
