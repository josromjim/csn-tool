const shapefile = require('shapefile-stream');
const through = require('through2');
const { BirdLife } = require('../db/postgres/models');
const { compressGeometry } = require('../helpers/birdlife');

/**
 * Use it only once if you need to add data to Postgres DB
 */
async function addBirdlifeData(req, res) {
  try {
    let n = 0;
    shapefile.createReadStream('SpeciesRequest.shp')
      .pipe(through.obj(async (data, enc, next) => {
        if (n >= 5) {
          await BirdLife.create({
            type: data.type,
            object_id: data.properties.OBJECTID,
            sis_id: data.properties.SISID,
            binomial: data.properties.binomial,
            presence: data.properties.presence,
            origin: data.properties.origin,
            seasonal: data.properties.seasonal,
            compiler: data.properties.compiler,
            yrcompiled: data.properties.yrcompiled,
            citation: data.properties.citation,
            source: data.properties.source,
            dist_comm: data.properties.dist_comm,
            version: data.properties.version,
            geometry: data.geometry
          });
        }
        n++;
        next();
      }));
    res.json({
      status: 'success'
    });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

async function getAndSaveAllBirdlifeData(req, res) {
  const count = 2322; // 2322;
  try {
    for (let i = 0; i < count; i += 1) {
      const birdLifeItems = await BirdLife.findAll({ offset: i, limit: 1, order: [['id', 'ASC']] });
      if (birdLifeItems && birdLifeItems.length > 0) {
        await birdLifeItems.map(async birdLifeItem => {
          const poly = birdLifeItem.dataValues;
          const coordinatesCompressed = compressGeometry(poly.geometry.coordinates);
          const geometryCompressed = {
            ...poly.geometry,
            coordinates: coordinatesCompressed
          };
          await BirdLife.update({ coordinates_compressed: geometryCompressed }, { where: { id: poly.id } });
        });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

module.exports = {
  addBirdlifeData,
  getAndSaveAllBirdlifeData
};
