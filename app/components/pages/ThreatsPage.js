import React from 'react';
import PropTypes from 'prop-types';
import ThreatsTable from 'containers/threats/ThreatsTable';
import { StickyContainer } from 'react-sticky';

class ThreatsPage extends React.Component {
  componentWillMount() {
    if (!this.props.threats) {
      this.props.getThreatsList();
    }
  }

  render() {
    return (
      <StickyContainer>
        <div className="l-page -header row">
          <div className="column c-table">
            <ThreatsTable data={this.props.threats} />
          </div>
        </div>
      </StickyContainer>
    );
  }
}

ThreatsPage.contextTypes = {
  t: PropTypes.func.isRequired
};


ThreatsPage.propTypes = {
  getThreatsList: PropTypes.func.isRequired,
  threats: PropTypes.any.isRequired // bool or array
};

export default ThreatsPage;
