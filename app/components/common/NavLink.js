import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router';

class NavLink extends React.Component {
  constructor(props, context) {
    super(props);
  }
  
  render() {
    let search = this.props.router && this.props.router.location && this.props.router.location.search;
    if (this.props.parent) {
      search = '';
    }
    return (
      <Link activeClassName="-current" className={this.props.className} to={`/${this.props.lang}${this.props.to}${search}`} onClick={(e) => e.stopPropagation()}>
        {this.props.i18nText ? this.context.t(this.props.i18nText) : this.props.text}
        {this.props.icon && <svg><use xlinkHref={`#${this.props.icon}`}></use></svg>}
        {this.props.children}
      </Link>
    );
  }
}

NavLink.contextTypes = {
  // Define function to get the translations
  t: PropTypes.func.isRequired
};

NavLink.propTypes = {
  // Define custom classnames
  className: PropTypes.string,
  // Define the language selected
  lang: PropTypes.string.isRequired,
  // Define the link to go
  to: PropTypes.string.isRequired,
  // Define the text to show
  text: PropTypes.string,
  // Define the text to show translated
  i18nText: PropTypes.string,
  // Define the icon used for the link
  icon: PropTypes.string,
  // Define the child componets
  children: PropTypes.any,
  // Define whether link is a top level
  parent: PropTypes.bool,
  // Define the child componets
  router: PropTypes.object
};

export default withRouter(NavLink);
