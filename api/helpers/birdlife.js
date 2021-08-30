const simplify = require('simplify-geometry');
const tolerance = 0.05;

const checkArrLine = arr => arr[0] && arr[0][0] && arr[0][0].length === 2 && arr[0][0][0] && typeof(arr[0][0][0]) !== 'object';
const checkArrLevel = arr => {
  /* eslint-disable */
  if (checkArrLine(arr)) return simplify(arr, tolerance);
  else {
    return arr.map(item => {
      if (checkArrLine(item)) {
        return item.map(subItem => simplify(subItem, tolerance));
      } else {
        return checkArrLevel(item[0]);
      }
    });
  }
};

const compressGeometry = geometry => checkArrLevel(geometry);

module.exports = {
  compressGeometry
};
