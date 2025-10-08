const { runQuery, getQueryString } = require('../helpers');
const cache = require('../helpers/cache');

async function getThreatsList(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `threats${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT p.species_main_id AS species_id, p.wpepopid AS pop_id, t.threat_id,
      p.scientificname as scientific_name, p.population_name AS population, t.threat_code, t.threat_label,
      t.description, t.scope, t.severity
      FROM threats t
      INNER JOIN populations p on p.wpepopid = t.pop_id
      INNER JOIN species s on s.species_id = p.species_main_id
      WHERE t.timing='Ongoing' AND severity NOT IN ('Negligible declines', 'Unknown', 'NA', 'No decline', '')
      ORDER BY s.taxonomic_sequence, t.threat_code`;

    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          const jsonData = JSON.stringify(results);
          await cache.add(cacheKey, jsonData);
          res.json(results);
        } else {
          res.status(404);
          res.json({ error: 'No threats' });
        }
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

module.exports = {
  getThreatsList
};
