const normalizeSiteStatus = require('../helpers/index').normalizeSiteStatus;
const mergeNames = require('../helpers/index').mergeNames;
const { runQuery, getQueryString } = require('../helpers');
const { BirdLife } = require('../db/postgres/models');
const bbox = require('geojson-bbox');
const cache = require('../helpers/cache');

async function getSpeciesList(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `species${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT s.scientific_name, s.english_name, s.french_name, s.genus, s.family,
    s.species_id as id, s.hyperlink, s.iucn_category, aewa_annex_2
    FROM species s
    ORDER BY s.taxonomic_sequence`;
    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          const jsonData = JSON.stringify(results);
          await cache.add(cacheKey, jsonData);
          res.json(results);
        } else {
          res.status(404);
          res.json({ error: 'No species' });
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

async function getSpeciesDetails(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `species/${req.params.id}/index${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT s.scientific_name, s.english_name, s.french_name, s.family,
      s.species_id as id, s.iucn_category, s.hyperlink
      FROM species s
      WHERE s.species_id = ${req.params.id}
    `;
    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          const row = results[0];
          const result = {
            species: [
              {
                scientific_name: row.scientific_name,
                english_name: row.english_name,
                french_name: row.french_name,
                family: row.family,
                id: row.id,
                iucn_category: row.iucn_category,
                hyperlink: row.hyperlink
              }
            ]
          };
          const jsonData = JSON.stringify(result);
          await cache.add(cacheKey, jsonData);
          res.json(result);
        } else {
          res.status(404);
          res.json({ error: 'Species details not available.' });
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

async function getSpeciesSites(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `species/${req.params.id}/sites${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT s.species_id,
      ss.iba_criteria, ss.maximum, ss.minimum,
      ss.season, ss.units, si.site_name, si.lat, si.lon, si.country, si.iso2,
      coalesce(si.protection_status, 'Unknown') AS protected,
      string_agg(p.population_name, ', ') as population,
      si.hyperlink, si.site_id AS id,
      si.site_id AS site_id, ss.geometric_mean,
      ss.start, ss._end as end
    FROM species s
    INNER JOIN species_sites_iba ss ON s.species_id = ss.species_id
    INNER JOIN populations p on p.species_main_id = s.species_id
    INNER JOIN sites_iba si ON ss.site_id = si.site_id
    WHERE s.species_id = '${req.params.id}'
    GROUP BY ss.iba_criteria, ss.maximum, ss.minimum, ss.units,
    ss.season, si.country, si.iso2, si.protection_status ,si.site_name, si.lat, si.lon,
    si.hyperlink, si.site_id, 1, ss.geometric_mean, ss.start, ss._end
    ORDER BY si.site_name`;
    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          results.map((item) => {
            const site = item;
            site.protected_slug = normalizeSiteStatus(item.protected);
            site.lat = +item.lat.toFixed(3);
            site.lon = +item.lon.toFixed(3);
            return site;
          });
          const jsonData = JSON.stringify(results);
          await cache.add(cacheKey, jsonData);
          res.json(results);
        } else {
          res.status(404);
          res.json({ error: 'No IBA sites for this species' });
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

async function getSpeciesCriticalSites(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `species/${req.params.id}/criticalSites${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT s.species_id,
      ss.popmax as maximum, ss.popmin as minimum, ss.season, ss.units,
      ss.yearstart AS start, ss.yearend AS end, ss.percentfly,
      si.site_name_clean AS csn_site_name, si.site_name_clean AS site_name,
      si.lat, si.lon, si.country, si.iso2,
      coalesce(si.protected, 'Unknown') as protected,
      p.population_name AS population,
      p.wpepopid AS pop_id,
      si.hyperlink, si.site_id AS id,
      si.site_id AS site_id, ss.geometric_mean,
      CASE
      WHEN ss.csn1 = 1 THEN true
      WHEN ss.csn1 = 0 THEN false
      ELSE null
      END as csn1,
      CASE
        WHEN ss.csn2 = 1 THEN true
        WHEN ss.csn2 = 0 THEN false
        ELSE null
      END AS csn2
    FROM species s
    INNER JOIN populations p on p.species_main_id = s.species_id
    INNER JOIN species_sites_critical ss ON p.wpepopid = ss.wpepopid
    INNER JOIN sites_critical si ON ss.site_id = si.site_id
    WHERE s.species_id = '${req.params.id}'
    ORDER BY si.site_name`;

    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          results.map((item) => {
            const site = item;
            site.protected_slug = normalizeSiteStatus(item.protected);
            site.lat = +item.lat.toFixed(3);
            site.lon = +item.lon.toFixed(3);
            return site;
          });
          const jsonData = JSON.stringify(results);
          await cache.add(cacheKey, jsonData);
          res.json(results);
        } else {
          res.status(404);
          res.json({ error: 'No species' });
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

async function getSpeciesPopulation(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `species/${req.params.id}/population${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT s.species_id AS id, p.wpepopid AS pop_id,
      p.population_name AS population, p.a, p.b, p.c,
      s.iucn_category, p.caf_action_plan, p.eu_birds_directive,
      table_1_status,
      p.species, p.wpepopid, p.flyway_range, p.year_start, p.year_end, p.size_min,
      p.size_max, p.ramsar_criterion_6 AS ramsar_criterion,
      p.size_method,
      p.trend_method,
      'http://wpe.wetlands.org/view/' || p.wpepopid AS pop_hyperlink
      FROM species s
      INNER JOIN populations p on p.species_main_id = s.species_id
      WHERE s.species_id = '${req.params.id}'
      ORDER BY p.population_name`;

    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          const jsonData = JSON.stringify(results);
          await cache.add(cacheKey, jsonData);
          res.json(results);
        } else {
          res.status(404);
          res.json({ error: 'There are no populations for this Species' });
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

async function getSpeciesPopulationThreats(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `species/${req.params.id}/populationThreats${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT p.species_main_id AS species_id, p.wpepopid AS pop_id, t.threat_id,
      p.population_name AS population, t.threat_code, t.threat_label,
      t.description, t.scope, t.severity
      FROM threats t
      INNER JOIN populations p on p.wpepopid = t.pop_id
      WHERE p.species_main_id = '${req.params.id}' AND p.wpepopid = ${req.params.populationId} 
        AND t.timing='Ongoing' AND severity NOT IN ('Negligible declines', 'Unknown', 'NA', 'No decline', '')
      ORDER BY t.threat_code`;

    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          const jsonData = JSON.stringify(results);
          await cache.add(cacheKey, jsonData);
          res.json(results);
        } else {
          res.status(404);
          res.json({ error: 'There are no threats for this Population' });
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


async function getSpeciesLookAlikeSpecies(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `species/${req.params.id}/look-alike-species/index${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT sq.scientific_name AS original_species,
      sq.species_id AS id,
      sq.wpepopid AS pop_id,
      sq.species_id, sq.english_name, sq.french_name,
      sq.population_name AS population, sq.a AS original_a,
      sq.b AS original_b, sq.c AS original_c, sq.wpepopid AS pop_id_origin,
      COUNT(*) AS confusion_species,
      COUNT(case when pi.a IS NOT NULL
            AND pi.a != '' then pi.population_name end) AS confusion_species_as
      FROM
      (
        SELECT confusion_group,
        sm.species_id, sm.scientific_name,
        sm.english_name, sm.french_name, pi.the_geom,
        pi.population_name, pi.a, pi.b, pi.c, pi.wpepopid
        FROM species AS sm
        INNER JOIN populations AS pi
        ON pi.species_main_id = sm.species_id
        WHERE sm.species_id = ${req.params.id}
        AND sm.confusion_group IS NOT NULL
      ) as sq

      INNER JOIN species AS sm ON
      (sq.confusion_group && sm.confusion_group)
      AND sm.species_id != sq.species_id
      INNER JOIN populations AS pi
      ON pi.species_main_id = sm.species_id
      AND ST_INTERSECTS(sq.the_geom, pi.the_geom)
      GROUP BY sq.scientific_name,
      sq.english_name, sq.french_name, sq.population_name,
      sq.a, sq.b, sq.c, sq.wpepopid, sq.species_id
      ORDER BY sq.population_name ASC`;

    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          const params = [
            {
              columnName: 'confusion_name',
              field1: 'confusion_species',
              field2: 'english_name'
            }
          ];
          const dataParsed = mergeNames(results, params);
          const jsonData = JSON.stringify(dataParsed);
          await cache.add(cacheKey, jsonData);
          res.json(dataParsed);
        } else {
          res.json([]);
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

async function getPopulationsLookAlikeSpecies(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `species/${req.params.id}/look-alike-species/${req.params.populationId}${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT
      sm.scientific_name AS scientific_name,
      sm.english_name,
      sm.french_name,
      pi.population_name AS population,
      pi.wpepopid,
      pi.a,
      pi.b,
      pi.c,
      sm.species_id AS id
      FROM ( SELECT confusion_group,
        sm.species_id, sm.scientific_name,
        pi.the_geom, pi.population_name, pi.a, pi.b, pi.c
        FROM species AS sm
        INNER JOIN populations AS pi
        ON pi.species_main_id = sm.species_id
        WHERE sm.confusion_group IS NOT NULL
        AND pi.wpepopid = ${req.params.populationId}
        AND sm.species_id = ${req.params.id}
      ) as sq
      INNER JOIN species AS sm ON (sq.confusion_group && sm.confusion_group) AND sm.species_id != sq.species_id
      INNER JOIN populations AS pi ON pi.species_main_id = sm.species_id AND ST_INTERSECTS(sq.the_geom, pi.the_geom)
      ORDER BY sm.taxonomic_sequence ASC, pi.population_name ASC`;

    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          const params = [
            {
              columnName: 'confusion_name',
              field1: 'confusion_species',
              field2: 'english_name'
            }
          ];
          const dataParsed = mergeNames(results, params);
          const jsonData = JSON.stringify(dataParsed);
          await cache.add(cacheKey, jsonData);
          res.json(dataParsed);
        } else {
          res.status(404);
          res.json({ error: 'There are no habitats for this Species' });
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

async function getPopulationVulnerability(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `species/${req.params.id}/population-vulnerability${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT
      CASE
      WHEN t1p.season = 'passage'
      THEN 'Passage'
      WHEN t1p.season = 'winter'
      THEN 'Wintering'
      WHEN t1p.season = 'SE'
      THEN 'Sedentary'
      WHEN t1p.season = 'breed'
      THEN 'Breeding'
      ELSE t1p.season
      END as season,
      CASE
      WHEN change_in_suitability_of_all_sites = 'NA'
      THEN null
      ELSE ROUND(cast(change_in_suitability_of_all_sites AS numeric), 2)
      END AS change_in_suitability_of_all_sites,
      CASE
      WHEN change_in_number_of_suitable_sites = 'NA'
      THEN null
      ELSE ROUND(cast(change_in_number_of_suitable_sites AS numeric), 2)
      END AS change_in_number_of_suitable_sites,
      CASE
      WHEN change_in_suitability_of_critical_sites = 'NA'
      THEN null
      ELSE ROUND(cast(change_in_suitability_of_critical_sites AS numeric), 2)
      END AS change_in_suitability_of_critical_sites,
      CASE
      WHEN change_in_proportion_supported = 'NA'
      THEN null
      ELSE ROUND(cast(change_in_proportion_supported AS numeric), 2)
      END AS change_in_proportion_supported,
      CASE
      WHEN range_change = 'NA'
      THEN null
      ELSE ROUND(cast(range_change AS numeric), 2)
      END AS range_change,
      CASE
      WHEN range_overlap = 'NA'
      THEN null
      ELSE ROUND(cast(range_overlap AS numeric), 2)
      END AS range_overlap,
      populations.population_name AS population_name,
      populations.wpepopid AS pop_id
      FROM table_1_populations AS t1p
      INNER JOIN populations ON populations.wpepopid = t1p.wpepopid
      WHERE t1p.ssis = '${req.params.id}'
      ORDER BY populations.population_name ASC`;

    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          const jsonData = JSON.stringify(results);
          await cache.add(cacheKey, jsonData);
          res.json(results);
        } else {
          res.status(404);
          res.json({ error: 'No vulnerability information' });
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

async function getTriggerCriticalSitesSuitability(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `species/${req.params.id}/trigger-cs-suitability${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT
      sites.country,
      sites.site_name_clean AS csn_site_name,
      sites.site_id,
      sites.lon,
      sites.lat,
      t2a.populationname AS population_name,
      t2a.wpepopid AS pop_id,
      t2a.season, t2a.percentfly, t2a.current_suitability,
      t2a.future_suitability, ROUND(CAST(change AS numeric), 2) AS change_suitability,
      threshold,
      CASE
        WHEN season_ev_good_fair_poor_look_at = 'P'
        THEN 'Poor'
        WHEN season_ev_good_fair_poor_look_at = 'F'
        THEN 'Fair'
        WHEN season_ev_good_fair_poor_look_at = 'G'
        THEN 'Good'
        ELSE season_ev_good_fair_poor_look_at
      END AS season_ev
      FROM table2a AS t2a
      INNER JOIN sites_critical sites ON sites.site_id = t2a.site_id
      WHERE t2a.ssis = '${req.params.id}'
      ORDER BY sites.site_name_clean ASC`;

    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          results.map((item) => {
            const row = item;
            row.lat = +item.lat.toFixed(3);
            row.lon = +item.lon.toFixed(3);
            return row;
          });
          const jsonData = JSON.stringify(results);
          await cache.add(cacheKey, jsonData);
          res.json(results);
        } else {
          res.status(404);
          res.json({ error: 'No critical sites suitability information' });
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

async function getSpeciesSeasons(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `species/${req.params.id}/seasons${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT DISTINCT season FROM table_1_species WHERE ssis = ${req.params.id}`;
    runQuery(query).then(async (data) => {
      const results = JSON.parse(data).rows || [];
      const jsonData = JSON.stringify(results);
      await cache.add(cacheKey, jsonData);
      res.json(results);
    });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

async function getSpeciesBirdlife(req, res) {
  res.writeHead(202, { 'Content-Type': 'application/json' });
  res.write(' ');
  // res.end(JSON.stringify(birdlifeJson));

  try {
    const { id } = req.params;
    const polygons = await BirdLife.findAll({ where: { sis_id: id } });
    if (!polygons) {
      throw new Error('have filter');
    }
    const rows = polygons.map(p => {
      const feature = {
        type: 'Feature',
        geometry: p.coordinates_compressed
      };
      const extent = bbox(feature);
      const resGeometry = {
        id: p.id,
        citation: p.citation,
        source: p.source,
        seasonal: p.seasonal,
        ...p.coordinates_compressed,
        ...{
          bbox: extent
        }
      };
      return resGeometry;
    });
    res.end(JSON.stringify({ rows }));
  } catch (err) {
    // res.status(err.statusCode || 500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

module.exports = {
  getSpeciesList,
  getSpeciesDetails,
  getSpeciesSeasons,
  getSpeciesSites,
  getSpeciesCriticalSites,
  getSpeciesPopulation,
  getSpeciesPopulationThreats,
  getSpeciesLookAlikeSpecies,
  getPopulationsLookAlikeSpecies,
  getPopulationVulnerability,
  getTriggerCriticalSitesSuitability,
  getSpeciesBirdlife
};
