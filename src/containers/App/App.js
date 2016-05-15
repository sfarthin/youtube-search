import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Helmet from 'react-helmet';
import { isLoaded as isFavoritesLoaded, load as loadFavorites } from 'redux/modules/favorites';
import _ from 'lodash';
// import { isLoaded as isAuthLoaded, load as loadAuth, logout } from 'redux/modules/auth';
// import { InfoBar } from 'components';
import { push } from 'react-router-redux';
import config from '../../config';
import { asyncConnect } from 'redux-async-connect';

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    if (!isFavoritesLoaded(getState())) {
      return dispatch(loadFavorites());
    }
  }
}])
@connect(
  (state) => ({favorites: state.favorites}),
  {pushState: push})
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired,
    favorites: PropTypes.object.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  render() {
    const styles = require('./App.scss');

    return (
      <div className={styles.app}>
        <Helmet {...config.app.head} />

        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <IndexLink to="/" activeClassName="active" style={{paddingLeft: '20px'}}>{config.app.title}</IndexLink>
            </Navbar.Brand>
          </Navbar.Header>
          <Nav>
            <LinkContainer to="/favorites">
              <NavItem eventKey={2}>Favorites <span className="badge">{_.size(this.props.favorites.data)}</span></NavItem>
            </LinkContainer>
          </Nav>
        </Navbar>

        <div className={styles.appContent}>
          {this.props.children}
        </div>
      </div>
    );
  }
}


// <InfoBar/>
//
// <div className="well text-center">
//   Have questions? Ask for help <a
//   href="https://github.com/erikras/react-redux-universal-hot-example/issues"
//   target="_blank">on Github</a> or in the <a
//   href="https://discord.gg/0ZcbPKXt5bZZb1Ko" target="_blank">#react-redux-universal</a> Discord channel.
// </div>
