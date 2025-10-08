import { connect } from 'react-redux';
import ThreatsTable from 'components/threats/ThreatsTable';
import { filterData } from 'helpers/filters';
import { filterColumnsBasedOnLanguage } from 'helpers/language';

const mapStateToProps = (state) => {
  const columns = state.threats.columns;
  const filter = state.threats.searchFilter;
  const data = state.threats.list;

  return {
    data: filterData({ data, columns, filter }) || [],
    columns,
    allColumns: filterColumnsBasedOnLanguage(state.threats.allColumns, state.i18nState.lang)
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ThreatsTable);
