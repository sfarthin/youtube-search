import React, {Component, PropTypes} from 'react';
import VideoDetailsBody from './videoDetailsBody';
import { Link } from 'react-router';

export default class VideoDetails extends Component {
  static propTypes = {
    videoid: PropTypes.string.isRequired,
    video: PropTypes.object.isRequired,
    stats: PropTypes.object
  }

  render() {
    const img = this.props.video.snippet.thumbnails.medium;

    return (
      <li className="media">
        <div className="media-left">
          <Link to={'/view/' + this.props.videoid}><img className="media-object" src={img.url} height={img.height} width={img.width} /></Link>
        </div>
        <VideoDetailsBody {...this.props} />
      </li>
    );
  }
}
