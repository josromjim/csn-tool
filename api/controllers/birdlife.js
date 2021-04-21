const fs = require('fs');
const bbox = require('geojson-bbox');

function getBirdlifeShape(res) {
  const filePathShape = 'public/json/birdlife/index.json';
  try {
    const data = fs.readFileSync(filePathShape);
    const poly = JSON.parse(data)[3];
    const feature = {
      type: 'Feature',
      geometry: poly
    };
    const extent = bbox(feature);
    const resGeometry = {
      ...poly,
      ...{
        bbox: extent
      }
    };
    res.json(resGeometry);
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

module.exports = {
  getBirdlifeShape
};
