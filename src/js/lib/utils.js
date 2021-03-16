// Factor all input numbers should be multiplied by so they won't lose
// precision due to floating point losses.
exports.DECIMAL = 100;

/**
 * Checks whether the given date is a valid Date.
 *
 * @param {string} date - Date to be checked.
 * @return {boolean} Whether the date is valid (true) or not (false).
 */
exports.isValidDate = function (date) {
  return (
    date &&
    Object.prototype.toString.call(date) === "[object Date]" &&
    !isNaN(date)
  );
};

/**
 * Checks whether the given pattern is a valid RegEx.
 *
 * @param {string} pattern - Pattern to be checked.
 * @return {boolean} Whether the pattern is valid (true) or not (false).
 */
exports.isValidRegex = function (pattern) {
  let valid = true;
  try {
    new RegExp(pattern);
  } catch (e) {
    valid = false;
  }
  return valid;
};

/**
 * Creates an object with each key set to the given value.
 *
 * @param {Array<string>} keys - The keys to set.
 * @param {any} value - The value to set to.
 * @return {Object} The newly created object.
 */
exports.fillObject = function (keys, value) {
  const object = {};
  for (const key of keys) {
    object[key] = value;
  }
  return object;
};
