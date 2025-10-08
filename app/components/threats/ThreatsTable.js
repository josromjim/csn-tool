import React from 'react';
import PropTypes from 'prop-types';
import TableListHeader from 'containers/threats/TableListHeader';
import TableList from 'components/tables/TableList';
import ThreatsFilters from 'components/threats/ThreatsFilters';
import { Sticky } from 'react-sticky';

class ThreatsTable extends React.Component {

  renderCommonTableHeader() {
    const { data, columns, allColumns } = this.props;
    return (
      <div>
        <ThreatsFilters data={data || []} columns={columns} />
        <TableListHeader
          data={data}
          columns={columns}
          allColumns={allColumns}
          detailLink
        />
      </div>
    );
  }

  render() {
    const { data, columns } = this.props;
    return (
      <div id="speciesTable">
        <Sticky topOffset={-50} stickyClassName="-sticky -small">
          {this.renderCommonTableHeader()}
        </Sticky>
        <TableList
          data={data}
          columns={columns}
          detailLink=""
        />
      </div>
    );
  }
}

ThreatsTable.contextTypes = {
  t: PropTypes.func.isRequired
};

ThreatsTable.propTypes = {
  allColumns: PropTypes.array.isRequired,
  data: PropTypes.any.isRequired,
  columns: PropTypes.array.isRequired
};

export default ThreatsTable;
