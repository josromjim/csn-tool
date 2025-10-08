import React from 'react';
import PropTypes from 'prop-types';
import CSVButton from 'components/tables/CSVButton.js';
import ThreatsSearch from 'containers/threats/ThreatsSearch';

function ThreatsFilters(props, context) {
  return (
    <div className="row c-table-filters">
      <div className="column small-12 medium-8">
        <h2 style={{ display: 'inline-block' }}>{context.t('threats')}</h2>
        <div style={{ display: 'inline-block', marginTop: 14, verticalAlign: 'top' }}>
          <CSVButton data={props.data} columns={props.columns} />
        </div>
      </div>
      <div className="column small-12 medium-4">
        <ThreatsSearch placeholder="threatsFilter" />
      </div>
    </div>
  );
}

ThreatsFilters.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array
};

ThreatsFilters.contextTypes = {
  t: PropTypes.func.isRequired
};

export default ThreatsFilters;
