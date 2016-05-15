import React, {Component} from 'react';
import Helmet from 'react-helmet';

export default class Favorites extends Component {
  render() {
    const styles = require('./Favorites.scss');
    return (
      <div className={styles.favoritesPage + ' container'}>
        <Helmet title="Favorite Videos" />
        <h1>Favorites</h1>
      </div>
    );
  }
}
