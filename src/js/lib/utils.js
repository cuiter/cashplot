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