import React from 'react';
import PropTypes from 'prop-types';
import I18n from 'redux-i18n';
import Header from 'containers/common/Header';
import FeedbackForm from 'components/common/Feedback';
import Footer from 'containers/common/Footer';
import {setTranslations} from 'redux-i18n';
import { connect } from 'react-redux';

import { translations as translationsLoad } from 'locales/translations';
  
class ContainerPage extends React.Component {
  constructor(props) {
    super(props);
    const translateObj = {};
    translateObj[this.props.location.pathname.split('/')[0]] = {};
    this.state = {
      translations : translateObj
    } 
  }

  componentDidMount() {
    translationsLoad
      .then((response)=>{
        this.setState({translations: response});
        this.props.setTranslations(this.state.translations);
      })
  }
 
  getChildContext() {
    const location = this.props.location;
    location.params = this.props.params;
    return { location };
  }

  componentWillReceiveProps(newProps) {
    this.trackBackLinks(newProps);
  }

  trackBackLinks(newProps) {
    const oldPath = this.props.location.pathname.split('/')[2];
    const newPath = newProps.location.pathname.split('/')[2];
    const routeLength = newProps.location.pathname.split('/').length;
    if (routeLength <= 3) {
      window.previousLocation = newProps.location;
    } else if (oldPath !== newPath) {
      window.previousLocation = this.props.location;
    }
  }
  //this.state.translations
  render() {
    return (
      <I18n translations={{}} initialLang={this.props.params.lang} useReducer={true}>
        <div>
          <Header />
          <FeedbackForm />
          <div className="l-main">
            {this.props.children}
          </div>
          <Footer />
        </div>
      </I18n>
    );
  }
}
 
ContainerPage.childContextTypes = {
  location: PropTypes.object
};

ContainerPage.propTypes = {
  /**
  * Define required content for page
  **/
  children: PropTypes.element.isRequired,
  /**
  * Finds the router params
  **/
  params: PropTypes.object,
  /**
  * Finds the route of current location in URL
  **/
  location: PropTypes.object
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  setTranslations: (translations) => {
    dispatch(setTranslations(translations));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ContainerPage);
