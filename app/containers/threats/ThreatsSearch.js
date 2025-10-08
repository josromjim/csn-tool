import { connect } from 'react-redux';
import SearchFilter from 'components/common/SearchFilter';
import { setSearchFilter, resetSearchFilter } from 'actions/threats';

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  setSearchFilter: (search) => dispatch(setSearchFilter(search)),
  resetSearchFilter: () => dispatch(resetSearchFilter())
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchFilter);
