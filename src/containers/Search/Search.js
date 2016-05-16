import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import queryString from 'query-string';
import _, { debounce } from 'lodash';
import numeral from 'numeral';
import moment from 'moment';
import { connect } from 'react-redux';
import { search as youTubeSearch } from 'redux/modules/youtube';
import { asyncConnect } from 'redux-async-connect';
import { push as pushState } from 'react-router-redux';

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const youtube = getState().youtube;
    const query = getState().routing.locationBeforeTransitions.query;
    if (!youtube || !youtube.result || query.q !== youtube.result.q || query.page !== youtube.result.page) {
      return dispatch(youTubeSearch(query));
    }
  }
}])
@connect(
    state => ({ youtube: state.youtube }),
    { pushState, youTubeSearch }
)
export default class Search extends Component {

  static propTypes = {
    location: PropTypes.object.isRequired,
    youTubeSearch: PropTypes.func.isRequired,
    youtube: PropTypes.object,
    pushState: PropTypes.func.isRequired
  }

  componentWillMount() {
    const debounceYouTubeSearch = debounce(function(query) {
      this.props.youTubeSearch(query);
      this.props.pushState(this.props.location.pathname + '?' + queryString.stringify(this.state.query));
    }.bind(this), 300);

    this.setState({
      query: queryString.parse(this.props.location.search),
      debounceYouTubeSearch: debounceYouTubeSearch
    });
  }

  // componentWillReceiveProps(props) {
  //   console.log(this.state.typing);
  //   if (!this.state.typing && props.location.query.q !== this.state.query.q) {
  //     this.setState({ query: queryString.parse(this.props.location.search) });
  //   }
  // }

  submit(e) {
    e.preventDefault();
    this.props.youTubeSearch(this.state.query);
  }

  /**
  * Given an object update the URL and youtube results without rerendering the page.
  **/
  changeQueryString(query) {
    // Set the state
    this.setState({ query: query });

    // Send a xhr
    this.state.debounceYouTubeSearch(query);

    // Set the browser querystring without effecting react rendering.
    let querystring = '';
    if (_.size(query)) querystring = '?' + queryString.stringify(query);
    history.replaceState({}, '', this.props.location.pathname + querystring);
  }

  /**
  * When a user starts typing, lets show instant results.
  **/
  keywordChange(e) {
    const keyword = e.target.value;

    // Determine new querystring
    const query = _.extend({}, this.state.query, {q: keyword});
    if (!query.q) delete query.q;
    delete query.page;

    this.changeQueryString(query);
  }

  orderChange(e) {
    const order = e.target.value;

    // Determine new querystring
    const query = _.extend({}, this.state.query, {order: order});
    if (query.order === 'date') delete query.order;
    delete query.page;

    this.changeQueryString(query);
  }

  render() {
    const styles = require('./Search.scss');
    const youtube = this.props.youtube;

    return (
      <div className={styles.searchPage + ' container'}>
        <Helmet title="Search" />
          <form className="form-inline" onSubmit={this.submit.bind(this)}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter your search query..."
                className={[styles.searchBox, 'form-control'].join(' ')}
                onChange={this.keywordChange.bind(this)}
                value={this.state.query.q}
                autoFocus
                />
            </div>
            <div className="form-group" style={{float: 'right'}}>
              <select className="form-control" value={this.state.query.order || 'date'} onChange={this.orderChange.bind(this)}>
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
                <option value="relevance">Sort by Relavance</option>
              </select>
            </div>
          </form>
          { youtube.searching && <p style={{ paddingTop: 30 }}><span className="fa fa-refresh fa-spin fa-3x fa-fw" /> Searching...</p> }
          { !youtube.searching && youtube.result && !!_.size(youtube.result.items) && <p style={{ paddingTop: 30 }}>{numeral(youtube.result.pageInfo.totalResults).format('0,0')} videos found</p> }
          <hr />
          { !youtube.searching && youtube.result && !_.size(youtube.result.items) && (
            <p>No Videos found</p>
          )}
          { youtube.result && !!_.size(youtube.result.items) && (
            <ul className="media-list">
              {_.map(youtube.result.items, function(item) {
                const snippet = item.snippet;
                const img = item.snippet.thumbnails.medium;
                const stats = youtube.stats && youtube.stats[item.id.videoId];

                return (
                  <li className="media">
                    <div className="media-left">
                      <img className="media-object" src={img.url} height={img.height} width={img.width} />
                    </div>
                    <div className="media-body" style={{ paddingLeft: 10 }}>
                      <h4><a>{snippet.title}</a></h4>
                      {snippet.description && <p>{snippet.description}</p>}
                      <p><i>Published {moment(snippet.publishedAt).fromNow()}.</i></p>
                      { stats && <p>{_.map(stats, (s, key) => <span style={{ paddingRight: 30 }}><strong>{key.replace('Count', 's')}</strong>: {numeral(s).format('0,0')}</span>)}</p>}
                    </div>
                  </li>
                );
              }, this)}
            </ul>
          )}
      </div>
    );
  }
}
