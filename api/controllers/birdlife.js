const fs = require('fs');

function getBirdlifeShape(req, res) {
  const filePathShape = `public/json/birdlife/index.json`;
  try {
    const data = fs.readFileSync(filePathShape);
    res.json(JSON.parse(data));  
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

module.exports = {
  getBirdlifeShape
};
