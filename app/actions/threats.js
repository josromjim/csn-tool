import {
  GET_THREATS_LIST,
  SET_SORT,
  SET_SEARCH_FILTER,
  SET_COLUMN_FILTER
} from 'constants/action-types';
import { TABLES } from 'constants/tables';


export function getThreatsList() {
  const url = `${config.apiHost}/threats`;
  return dispatch => {
    try {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          dispatch({
            type: GET_THREATS_LIST,
            payload: data
          });
        });
    } catch (err) {
      dispatch({
        type: GET_THREATS_LIST,
        payload: []
      });
    }
  };
}

export function setSearchFilter(search) {
  return {
    type: `${SET_SEARCH_FILTER}_${TABLES.THREATS}`,
    payload: search
  };
}

export function resetSearchFilter() {
  return {
    type: `${SET_SEARCH_FILTER}_${TABLES.THREATS}`,
    payload: ''
  };
}

export function setThreatsTableSort(sort) {
  return {
    type: `${SET_SORT}_${TABLES.THREATS}`,
    payload: sort
  };
}

export function setThreatsFilter(filter) {
  return {
    type: `${SET_COLUMN_FILTER}_${TABLES.THREATS}`,
    payload: filter
  };
}
