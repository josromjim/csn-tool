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

function getQueryLookAlikeByOne(iso='', populationId=0) {
  return `
  SELECT
    sm.scientific_name AS scientific_name,
    sm.english_name,
    sm.french_name,
    sm.species_id AS id,
    pi.population_name AS population,
    pi.a,
    pi.b,
    pi.c,
    pi.wpepopid,
    pi.wpepopid AS pop_id
  FROM
  (
    SELECT 
    sm.confusion_group,
    sm.species_id, 
    sm.scientific_name,
    sm.taxonomic_sequence,
    pi.the_geom, 
    pi.wpepopid, 
    pi.population_name, 
    pi.a, 
    pi.b, 
    pi.c
    FROM species AS sm
    INNER JOIN species_country AS sc
    ON sc.species_id = sm.species_id
    AND sc.iso = '${iso}'
    INNER JOIN world_borders AS wb ON
    wb.iso3 = sc.iso
    INNER JOIN populations AS pi
    ON ST_INTERSECTS(pi.the_geom, wb.the_geom)
    AND pi.species_main_id = sm.species_id
    AND pi.wpepopid = ${populationId}
    WHERE sm.confusion_group IS NOT NULL
    GROUP BY confusion_group,
    sm.species_id, 
    sm.scientific_name,
    sm.taxonomic_sequence,
    pi.the_geom, 
    pi.wpepopid, 
    pi.population_name, 
    pi.a, 
    pi.b, 
    pi.c
  ) as sq
  INNER JOIN species AS sm ON
  (sq.confusion_group && sm.confusion_group)
  AND sm.species_id != sq.species_id
  INNER JOIN world_borders AS wb ON
  wb.iso3 = '${iso}'
  INNER JOIN populations AS pi
  ON ST_INTERSECTS(pi.the_geom, wb.the_geom)
  AND ST_INTERSECTS(pi.the_geom, sq.the_geom)
  AND pi.species_main_id = sm.species_id
  ORDER BY sm.taxonomic_sequence ASC`;
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
