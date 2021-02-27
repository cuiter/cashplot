const utils = require("./utils");

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
   *                           startingBalance (number multiplied by
   *                           utils.DECIMAL) and addToNet (boolean).
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
    if (typeof this.transactionData !== "string") {
      return "Transaction data not provided";
    }
    if (typeof this.transactionFileName !== "string") {
      return "Transaction file name not provided";
    }
    if (!Array.isArray(this.accounts)) {
      return "Accounts is not an array";
    }
    if (this.accounts.length < 1) {
      return "Accounts must have at least one element";
    }
    for (const account of this.accounts) {
      if (typeof account !== "object") {
        return "An account is not of type object";
      }
      if (typeof account.name !== "string") {
        return "An account name is not of type string";
      }
      if (account.name === "") {
        return "An account name is empty";
      }
      if (typeof account.startingBalance !== "number") {
        return "An account starting balance is not of type number";
      }
      if (!Number.isFinite(account.startingBalance)) {
        return "An account starting balance is not a number";
      }
      if (typeof account.addToNet !== "boolean") {
        return "An account add-to-net is not of type boolean";
      }
    }
    if (!Array.isArray(this.categories)) {
      return "Categories is not an array";
    }
    for (const category of this.categories) {
      if (typeof category !== "object") {
        return "A category is not of type object";
      }
      if (typeof category.name !== "string") {
        return "A category name is not of type string";
      }
      if (category.name === "") {
        return "A category name is empty";
      }
      if (typeof category.descriptionPattern !== "string") {
        return "A category description pattern is not of type string";
      }
      if (!utils.isValidRegex(category.descriptionPattern)) {
        return "A category description pattern is not a valid regex";
      }
      if (typeof category.counterAccountPattern !== "string") {
        return "A category counter-account pattern is not of type string";
      }
      if (!utils.isValidRegex(category.counterAccountPattern)) {
        return "A category counter-account pattern is not a valid regex";
      }
    }
    return null;
  }
}

exports.Parameters = Parameters;
