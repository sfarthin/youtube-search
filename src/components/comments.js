import React, {Component, PropTypes} from 'react';
import { comments as youTubeComments, moreComments as youTubeMoreComments } from 'redux/modules/youtube';
import { connect } from 'react-redux';
import { map, union } from 'lodash';
// import numeral from 'numeral';
import moment from 'moment';

class CommentThread extends Component {
  static propTypes = {
    authorProfileImageUrl: PropTypes.string.isRequired,
    authorDisplayName: PropTypes.string.isRequired,
    textDisplay: PropTypes.string.isRequired,
    publishedAt: PropTypes.string.isRequired,
    replies: PropTypes.array
  }
  render() {
    const { publishedAt, textDisplay, authorProfileImageUrl, authorDisplayName, replies } = this.props;
    return (
      <div className="media">
        <div className="media-left">
          <img className="media-object" src={ authorProfileImageUrl } alt={ authorDisplayName } />
        </div>
        <div className="media-body">
          <h4 className="media-heading">{ authorDisplayName }</h4>
          <p dangerouslySetInnerHTML={{__html: textDisplay}} />
          <p><i>{ moment(publishedAt).fromNow() }</i></p>
          { map(replies, (r) => <CommentThread {...r.snippet} key={r.id} />) }
        </div>
      </div>
    );
  }
}

@connect(
  function(state, props) {
    if (state.youtube.comments && state.youtube.comments.id === props.videoid) {
      return {
        comments: state.youtube.comments,
        moreComments: state.youtube.moreComments
      };
    }
    return {};
  },
  { youTubeComments, youTubeMoreComments }
)
export default class Comments extends Component {
  static propTypes = {
    videoid: PropTypes.string.isRequired,
    youTubeComments: PropTypes.func.isRequired,
    youTubeMoreComments: PropTypes.func.isRequired,
    comments: PropTypes.object,
    moreComments: PropTypes.object
  }
  componentDidMount() {
    if (!this.props.comments) {
      this.props.youTubeComments(this.props.videoid);
    }
  }

  showMore(token) {
    return () => this.props.youTubeMoreComments(this.props.videoid, token);
  }

  combinedCommentThread() {
    const { comments } = this.props;
    return this._combinedCommentThread(comments.nextPageToken, comments.items);
  }

  _combinedCommentThread(token, combinedComments) {
    const { moreComments } = this.props;

    // If we hit the end of the comments, lets send them all back
    if (!token) return { nextPageToken: null, combinedComments: combinedComments };

    // We havn't fetched these comments yet, so lets indicate that you can pull more.
    const comments = moreComments[token];
    if (!comments) return { nextPageToken: token, combinedComments: combinedComments };

    // Lets keep recurring
    return this._combinedCommentThread(comments.nextPageToken, union(combinedComments, comments.items));
  }

  render() {
    const { comments } = this.props;
    if (!comments) {
      return (
        <div><span className="fa fa-refresh fa-spin fa-fw" /> Loading...</div>
      );
    }
    const { nextPageToken, combinedComments } = this.combinedCommentThread();
    return (
      <div>
        <h3>Comments</h3>
        <hr />
        { map(combinedComments, function(comment) {
          const replies = comment.replies && comment.replies.comments;
          const { topLevelComment } = comment.snippet;
          return <CommentThread {...topLevelComment.snippet} replies={replies} key={topLevelComment.id} />;
        }) }
        { nextPageToken && <button className="btn btn-default" onClick={this.showMore(nextPageToken)} style={{ marginTop: 30 }}>Show More Comments</button> }
      </div>
    );
  }
}
