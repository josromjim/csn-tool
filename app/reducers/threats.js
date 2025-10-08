import {
  GET_THREATS_LIST
} from 'constants/action-types';
import {
  ALL_THREATS_COLUMNS,
  DEFAULT_THREATS_COLUMNS,
  TABLES
} from 'constants/tables';
import withTable from 'reducers/withTable';

const initialState = {
  columns: DEFAULT_THREATS_COLUMNS,
  allColumns: ALL_THREATS_COLUMNS,
  list: false,
  searchFilter: '',
  stats: {},
  sort: {
    field: '',
    order: ''
  },
  columnFilter: {}
};

const threatsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_THREATS_LIST:
      return Object.assign({}, state, { list: action.payload });
    default:
      return state;
  }
};

export default withTable(TABLES.THREATS, threatsReducer);
