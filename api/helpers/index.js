/* eslint-disable no-console */

const rp = require('request-promise');
const CARTO_SQL = require('../constants').CARTO_SQL;
const fs = require('fs');

function getQueryString(query) {
  const strQuery = query
    && Object.keys(query).length > 0
    ? encodeURIComponent(
      `?${Object.keys(query)
        .map(item => `${item}%3D${query[item]}`)
        .join('&')}`)
    : '';
  return strQuery;
}

function normalizeSiteStatus(string) {
  if (string && string !== undefined) {
    const uString = string.toUpperCase();
    if (uString.indexOf('WHOLE') >= 0) return 'whole';
    if (uString.indexOf('MOST') >= 0) return 'most';
    if (uString.indexOf('SOME') >= 0) return 'some';
    if (uString.indexOf('LITTLE') >= 0) return 'little';
  }
  return 'unknown';
}

function mergeNames(data, params) {
  return data.map((item) => {
    const newItem = item;
    params.forEach((param) => {
      newItem[param.columnName] = `${item[param.field1]} (${
        item[param.field2]
      })`;
    });
    return newItem;
  });
}

function runQuery(q, options = {}) {
  const query = q.replace(/^\s*[\r\n]/gm, ''); // remove empty lines
  if (process.env.NODE_ENV === 'development') {
    console.log('RUNNING QUERY: \n', query);
  }

  return rp({
    uri: CARTO_SQL,
    qs: {
      ...options,
      q: query
    }
  });
}
/* eslint-disable */
function saveFileSync(path, data) {
  const list = path.split(/[\\\/]/);
  list.pop();
  list.reduce((directories, directory) => {
    directories += `${directory}/`;
    if (!fs.existsSync(directories)) {
      fs.mkdirSync(directories);
    }
    return directories;
  }, '');
  fs.writeFileSync(path, data, {
    encoding : 'utf8',
    mode : 0o777,
    flag : 'w+'
  });
}
/* eslint-enable */

module.exports = {
  normalizeSiteStatus,
  mergeNames,
  runQuery,
  saveFileSync,
  getQueryString,
  getQueryLookAlikeByOne
};
