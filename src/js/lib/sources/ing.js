const assert = require("assert");
const utils = require("../utils");

/**
 * A single ING Bank transaction.
 */
class INGTransaction {
  /**
   * Creates a new INGTransaction instance.
   *
   * @param {Date} date - The date on which the transaction was made.
   * @param {string} counterName - The name of the counter-account.
   * @param {string} account - The account on which the transaction was made.
   * @param {string} counterAccount - The counter-account.
   * @param {string} code - The two-letter code indicating the type of
   *                        transaction.
   * @param {boolean} direction - Whether the amount was sent (false) or
   *                              received (true).
   * @param {number} amount - The amount sent/received, multiplied by
   *                          utils.DECIMAL.
   * @param {string} type - Indicates the type of transaction.
   * @param {string} description - Any additional information about the
   *                               transaction itself.
   * @param {string} [balanceAfter] - The balance on the account after the
   *                                  transaction was made, multiplied by
   *                                  utils.DECIMAL.
   * @param {string} [tag] - Tag name.
   */
  constructor(
    date,
    counterName,
    account,
    counterAccount,
    code,
    direction,
    amount,
    type,
    description,
    balanceAfter = null,
    tag = null
  ) {
    assert.ok(utils.isValidDate(date));
    assert.equal(typeof counterName, "string");
    assert.equal(typeof account, "string");
    assert.equal(typeof counterAccount, "string");
    assert.equal(typeof code, "string");
    assert.equal(typeof direction, "boolean");
    assert.ok(Number.isFinite(amount));
    assert.equal(typeof type, "string");
    assert.equal(typeof description, "string");
    if (balanceAfter !== null) {
      assert.ok(Number.isFinite(balanceAfter));
    }
    if (tag !== null) {
      assert.equal(typeof tag, "string");
    }

    this.date = date;
    this.counterName = counterName;
    this.account = account;
    this.counterAccount = counterAccount;
    this.code = code;
    this.direction = direction;
    this.amount = amount;
    this.type = type;
    this.description = description;
    this.balanceAfter = balanceAfter;
    this.tag = tag;
  }

  /**
   * Converts the ING transaction to a Transaction.
   * @return {Transaction}
   */
  toTransaction() {
    return undefined;
  }

  /**
   * Loads a transaction from a parsed CSV row.
   * @param {Array} row - Array of strings.
   * @return {INGTransaction} - The loaded transaction.
   */
  static loadRow(row) {
    return new INGTransaction();
  }

  /**
   * Loads transactions from data (coming from a transactions file).
   * @param {string} data - Transaction data in CSV format.
   * @return {Array<INGTransaction>} - The loaded transactions.
   */
  static loadTransactions(data) {
    return undefined;
  }
}

exports.INGTransaction = INGTransaction;
