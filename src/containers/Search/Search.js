import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import queryString from 'query-string';
import { size, extend, map, debounce, pick } from 'lodash';
import numeral from 'numeral';
import { connect } from 'react-redux';
import { search as youTubeSearch } from 'redux/modules/youtube';
import { asyncConnect } from 'redux-async-connect';
import { push as pushState } from 'react-router-redux';

import { VideoDetails } from 'components';

function isEqualQuery(query1, query2) {
  return query1.q === query2.q && query1.page === query2.page && query1.order === query2.order;
}

function isSearchLoaded(youtube, query) {
  return youtube && youtube.result && isEqualQuery(youtube.result, query);
}

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const youtube = getState().youtube;
    const query = getState().routing.locationBeforeTransitions.query;
    if (query.q && !isSearchLoaded(youtube, query)) {
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
    this.setState({
      query: pick(this.props.youtube.result, ['q', 'order', 'page', 'pageToken']),
      debounceYouTubeSearch: debounce(this.search.bind(this), 600)
    });
  }

  componentDidMount() {
    this._popState = function() {
      this.props.pushState(this.props.location.pathname + document.location.search);
      this.setState({ query: queryString.parse(document.location.search) });
    }.bind(this);
    window.addEventListener('popstate', this._popState);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this._popState);
  }

  /* Search without reloading component */
  search() {
    if (!this.props.youtube.searching && !isSearchLoaded(this.props.youtube, this.state.query)) this.props.youTubeSearch(this.state.query);
    this.setState({ isTyping: false });
  }

  /* On form submit with Enter keypress */
  submit(e) {
    e.preventDefault();
    if (!this.props.youtube.searching && !isSearchLoaded(this.props.youtube, this.state.query)) {
      this.changeQueryString(this.state.query);
      this.search();
    }
  }

  /* replace querystring without calling a location change */
  changeQueryString(query) {
    let querystring = '';
    if (size(query)) querystring = '?' + queryString.stringify(query);

    // To have meaningful back and forward points.
    if (this.state.isTyping) {
      history.replaceState({}, '', this.props.location.pathname + querystring);
    } else {
      history.pushState({}, '', this.props.location.pathname + querystring);
    }
  }

  /**
  * When a user starts typing, lets show instant results.
  **/
  keywordChange(e) {
    const keyword = e.target.value;

    // Determine new querystring
    const query = extend({}, this.state.query, {q: keyword});
    if (!query.q) delete query.q;
    delete query.page;
    delete query.pageToken;

    // Replace querystring as we type
    this.changeQueryString(query);

    // Set local state and set up debouncer, but don't reload whole component.
    this.setState({ query: query, isTyping: true });
    this.state.debounceYouTubeSearch(query);
  }

  orderChange(e) {
    const order = e.target.value;

    // Determine new querystring
    const query = extend({}, this.state.query, {order: order});
    if (query.order === 'date') delete query.order;
    delete query.page;
    delete query.pageToken;

    this.setState({ query: query });
    this.props.pushState(this.props.location.pathname + '?' + queryString.stringify(query));
  }

  changePage(page, pageToken) {
    return function() {
      const query = extend({}, this.state.query, { page: page, pageToken: pageToken });
      this.setState({ query: query });
      this.props.pushState(this.props.location.pathname + '?' + queryString.stringify(query));
    }.bind(this);
  }

  render() {
    const styles = require('./Search.scss');
    const youtube = this.props.youtube;
    const numPages = youtube.result && youtube.result.pageInfo.totalResults / youtube.result.pageInfo.resultsPerPage;
    const page = (youtube.result && youtube.result.page ? Number(youtube.result.page) : 1);
    const nextButton = youtube && youtube.result && youtube.result.nextPageToken && <div><button className="btn btn-primary" onClick={this.changePage(page + 1, youtube.result.nextPageToken)} style={{ float: 'right' }}>Next Page <span className="fa fa-arrow-right" /></button></div>;
    const prevButton = youtube && youtube.result && youtube.result.prevPageToken && <div><button className="btn btn-primary" onClick={this.changePage(page - 1, youtube.result.prevPageToken)} style={{ float: 'left' }}><span className="fa fa-arrow-left" /> Previous Page</button></div>;

    let videoList = null;
    if (youtube.result && !!size(youtube.result.items)) {
      videoList = (
        <ul className="media-list" style={{ clear: 'both', paddingTop: 30 }}>
         { map(youtube.result.items, (item) => <VideoDetails video={item} stats={youtube.stats && youtube.stats[item.id.videoId]} videoid={item.id.videoId} key={item.id.videoId} />) }
        </ul>
       );
    }

    let resultsText = <p style={{ paddingTop: 30 }}>&nbsp;</p>;
    if (!youtube.searching && youtube.result && !!size(youtube.result.items)) {
      resultsText = <p style={{ paddingTop: 30 }}>{numeral(youtube.result.pageInfo.totalResults).format('0,0')} videos found. Page {page} of {numeral(numPages).format('0,0')}.</p>;
    }

    let statusText = null;
    if (youtube.searching) {
      statusText = <p style={{ paddingTop: 30 }}><span className="fa fa-refresh fa-spin fa-fw" /> Searching...</p>;
    } else if (!youtube.searching && youtube.result && !size(youtube.result.items)) {
      statusText = <p>No Videos found</p>;
    } else if (!youtube.searching && !youtube.result) {
      statusText = <p>No videos to show yet...</p>;
    }

    return (
      <div className={styles.searchPage + ' container'}>
        <Helmet title="Search" />
          <form className="form-inline" onSubmit={this.submit.bind(this)}>
            <div className="form-group">
              <input
                type="search"
                name="search"
                autoSave="youtubeSearch"
                results="10"
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
          { resultsText }
          <hr />
          { statusText }
          { nextButton }
          { prevButton }
          { videoList }
          { nextButton }
          { prevButton }
      </div>
    );
  }
}
