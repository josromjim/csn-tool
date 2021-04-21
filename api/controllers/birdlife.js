const fs = require('fs');
const bbox = require('geojson-bbox');
//var shapefile = require('shapefile-stream');
//var through = require('through2');

function getBirdlifeShape(req, res) {
  
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
  
 /*
  let n = 0;
  shapefile.createReadStream( 'public/shape/SpeciesRequest.shp' )
    .pipe( through.obj( function( data, enc, next ){
      console.log(
        data
      );
      if (n < 5) {
        next();
      }
      n++;
    }));
*/
}

module.exports = {
  getBirdlifeShape
};
