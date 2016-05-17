import React, {Component, PropTypes} from 'react';
import moment from 'moment';
import numeral from 'numeral';
import { map } from 'lodash';
import { Link } from 'react-router';


export default class VideoDetailsBody extends Component {
  static propTypes = {
    video: PropTypes.object.isRequired,
    videoid: PropTypes.string.isRequired,
    stats: PropTypes.object
  }

  render() {
    const {video, stats, videoid} = this.props;
    const snippet = video.snippet;

    return (
      <div className="media-body" style={{ paddingLeft: 10 }}>
        <h4><Link to={'/view/' + videoid}>{snippet.title}</Link></h4>
        {snippet.description && <p>{map(snippet.description.split(/\n/), (seg) => <span>{seg}<br /></span>)}</p>}
        <p><i>Published {moment(snippet.publishedAt).fromNow()}.</i></p>
        { stats && <p>{map(stats, (s, key) => <span key={key} style={{ paddingRight: 30 }}><strong>{key.replace('Count', 's')}</strong>: {numeral(s).format('0,0')}</span>)}</p>}
      </div>
    );
  }
}
