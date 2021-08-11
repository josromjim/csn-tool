const cache = require('../helpers/cache');

async function clearCache(req, res) {
  try {
    await cache.clearAll();
    res.status(200);
    res.json({ status: 'success' });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

module.exports = {
  clearCache
};
