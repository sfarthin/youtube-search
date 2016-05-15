import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import queryString from 'query-string';
import _ from 'lodash';

export default class Search extends Component {

  static propTypes = {
    location: PropTypes.object.isRequired,
    query: PropTypes.string.isRequired
  }

  componentWillMount() {
    this.setState({
      query: queryString.parse(this.props.location.search)
    });
  }

  keywordChange(e) {
    const keyword = e.target.value;
    // Determine new "query"
    const query = _.extend({}, this.state.query, {q: keyword});
    if (!query.q) delete query.q;
    delete query.page;

    // Set the state
    this.setState({ query: query });

    // Set the browser querystring
    let querystring = '';
    if (_.size(query)) querystring = '?' + queryString.stringify(query);
    history.replaceState({}, '', this.props.location.pathname + querystring);
  }

  render() {
    console.log(this.state.query);
    const styles = require('./Search.scss');

    return (
      <div className={styles.searchPage + ' container'}>
        <Helmet title="Search" />
          <form className="form-inline">
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
              <select className="form-control">
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
                <option value="relevance">Sort by Relavance</option>
              </select>
            </div>
          </form>
      </div>
    );
  }
}
