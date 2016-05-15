import React, {Component} from 'react';
import Helmet from 'react-helmet';

export default class Search extends Component {
  render() {
    const styles = require('./Search.scss');
    return (
      <div className={styles.searchPage + ' container'}>
        <Helmet title="Search" />
        <h1>Search</h1>
      </div>
    );
  }
}
