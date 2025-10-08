import { connect } from 'react-redux';
import TableListHeader from 'components/tables/TableListHeader';
import { setThreatsTableSort, setThreatsFilter } from 'actions/threats';
import { changeColumnActivation } from 'actions/common';
import { TABLES } from 'constants/tables';

const mapStateToProps = (state) => ({
  sort: state.threats.sort
});

const mapDispatchToProps = (dispatch) => ({
  sortBy: (sort) => dispatch(setThreatsTableSort(sort)),
  filterBy: (filter) => dispatch(setThreatsFilter(filter)),
  changeColumnActivation: (column) => dispatch(changeColumnActivation(column, TABLES.THREATS))
});

export default connect(mapStateToProps, mapDispatchToProps)(TableListHeader);
