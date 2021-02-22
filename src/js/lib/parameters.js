/**
 * Checks whether the given pattern is a valid RegEx.
 *
 * @param {string} pattern - Pattern to be checked.
 * @return {boolean} Whether the pattern is valid (true) or not (false).
 */
function isValidRegex(pattern) {
  let valid = true;
  try {
    new RegExp(pattern);
  } catch (e) {
    valid = false;
  }
  return valid;
}

/**
 * Parameters holds the various inputs for generating graphs.
 */
class Parameters {
  /**
   * Creates a new Parameters instance. Does not perform data validation.
   *
   * @param {string} transactionData
   * @param {string} transactionFileName
   * @param {Array} accounts - Every element must contain a name (string),
   *                           startingBalance (number) and addToNet (boolean).
   * @param {Array} categories - Every element must contain a name (string),
   *                             descriptionPattern (string) and
   *                             counterAccountPattern (string).
   */
  constructor(transactionData, transactionFileName, accounts, categories) {
    this.transactionData = transactionData;
    this.transactionFileName = transactionFileName;
    this.accounts = accounts;
    this.categories = categories;
  }

  /**
   * Validates whether the parameters are correct.
   *
   * @return {null|string} Message explaining why validation failed,
   *                        or null if the data is valid.
   */
  validate() {
    if (typeof(this.transactionData) !== 'string') {
      return 'transactionData is not a string';
    }
    if (typeof(this.transactionFileName) !== 'string') {
      return 'transactionFileName is not a string';
    }
    if (!Array.isArray(this.accounts)) {
      return 'accounts is not a string';
    }
    if (this.accounts.length < 1) {
      return 'accounts must have at least one element';
    }
    for (const account of this.accounts) {
      if (typeof(account) !== 'object') {
        return 'an element from accounts is not of type object';
      }
      if (typeof(account.name) !== 'string') {
        return 'an account.name from accounts is not of type string';
      }
      if (typeof(account.startingBalance) !== 'number') {
        return 'an account.startingBalance from accounts is not of type number';
      }
      if (typeof(account.addToNet) !== 'boolean') {
        return 'an account.addToNet from accounts is not of type boolean';
      }
    }
    if (!Array.isArray(this.categories)) {
      return 'categories is not a string';
    }
    for (const category of this.categories) {
      if (typeof(category) !== 'object') {
        return 'an element from categories is not of type object';
      }
      if (typeof(category.name) !== 'string') {
        return 'a category.name from categories is not of type string';
      }
      if (typeof(category.descriptionPattern) !== 'string') {
        return 'a category.descriptionPattern from categories is not of type string';
      }
      if (!isValidRegex(category.descriptionPattern)) {
        return 'a category.descriptionPattern from categories is not a valid regex';
      }
      if (typeof(category.counterAccountPattern) !== 'string') {
        return 'a category.counterAccountPattern from categories is not of type string';
      }
      if (!isValidRegex(category.counterAccountPattern)) {
        return 'a category.counterAccountPattern from categories is not a valid regex';
      }
    }
    return null;
  }
}

exports.Parameters = Parameters;
