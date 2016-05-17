import React, {Component, PropTypes} from 'react';
import VideoDetailsBody from './videoDetailsBody';

export default class VideoDetails extends Component {
  static propTypes = {
    video: PropTypes.object.isRequired,
    stats: PropTypes.object
  }

  render() {
    const img = this.props.video.snippet.thumbnails.medium;

    return (
      <li className="media">
        <div className="media-left">
          <img className="media-object" src={img.url} height={img.height} width={img.width} />
        </div>
        <VideoDetailsBody {...this.props} />
      </li>
    );
  }
}
