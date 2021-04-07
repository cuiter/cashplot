/** @module */
const assert = require("nanoassert");

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
  return !!(
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
    assert(typeof pattern === "string");
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
 * @param {boolean} [deepClone=false] - Whether to deep-clone the value for each key.
 * @return {Object} The newly created object.
 */
exports.fillObject = function (keys, value, deepClone = false) {
  assert(Array.isArray(keys));
  assert(keys.every((key) => typeof key === "string"));

  const object = {};
  for (const key of keys) {
    if (deepClone) {
      object[key] = JSON.parse(JSON.stringify(value));
    } else {
      object[key] = value;
    }
  }
  return object;
};

/**
 * Interleaves the values of two arrays into a new array.
 * Example: [1, 2], [3, 4] => [1, 3, 2, 4]
 *
 * @param {Array} array1 - First array.
 * @param {Array} array2 - Second array.
 * @return {Array} The interleaved array.
 */
exports.interleaveArrays = function (array1, array2) {
  assert(Array.isArray(array1));
  assert(Array.isArray(array2));
  assert(array1.length === array2.length);

  return array1.map((value, idx) => [value, array2[idx]]).flat();
};
