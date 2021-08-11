const { Cache: CacheModel } = require('../db/postgres/models');

const get = async (key) => {
  const res = {
    key,
    status: '',
    value: null
  };
  try {
    const data = await CacheModel.findOne({ where: { key }, raw: true });
    res.value = data && data.value ? data.value : null;
    res.status = 'success';
  } catch (ex) {
    res.status = 'fail';
    res.error = ex;
  }
  return res;
};

const add = async (key, value) => {
  const res = {
    key,
    status: ''
  };
  try {
    await CacheModel.create({ key, value });
    res.status = 'success';
  } catch (ex) {
    res.status = 'fail';
    res.error = ex;
  }
  return res;
};

const remove = async (key) => {
  const res = {
    key,
    status: ''
  };
  try {
    await CacheModel.destroy({ where: { key } });
    res.status = 'success';
  } catch (ex) {
    res.status = 'fail';
    res.error = ex;
  }
  return res;
}

const clearAll = async () => {
  const res = {
    key,
    status: ''
  };
  try {
    await CacheModel.destroy({ where: { key } });
    res.status = 'success';
  } catch (ex) {
    res.status = 'fail';
    res.error = ex;
  }
  return res;
}

module.exports = {
  add,
  remove,
  clearAll,
  get,
};
