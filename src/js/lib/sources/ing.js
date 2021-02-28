const assert = require("nanoassert");
const Papa = require("papaparse");
const utils = require("../utils");

const Transaction = require("../transactions").Transaction;

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
    assert(utils.isValidDate(date));
    assert(typeof counterName === "string");
    assert(typeof account === "string");
    assert(typeof counterAccount === "string");
    assert(typeof code === "string");
    assert(typeof direction === "boolean");
    assert(Number.isFinite(amount));
    assert(typeof type === "string");
    assert(typeof description === "string");
    if (balanceAfter !== null) {
      assert(Number.isFinite(balanceAfter));
    }
    if (tag !== null) {
      assert(typeof tag === "string");
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
    return new Transaction(
      this.date,
      this.counterName,
      this.counterAccount,
      this.description,
      this.direction ? this.amount : -this.amount
    );
  }

  /**
   * Loads a transaction from a parsed CSV row.
   * @param {Array} row - Array of strings.
   * @return {INGTransaction} - The loaded transaction.
   */
  static loadRow(row) {
    const date = new Date(
      row[0].substr(0, 4) +
        "-" +
        row[0].substr(4, 2) +
        "-" +
        row[0].substr(6, 2)
    );
    const counterName = row[1];
    const account = row[2];
    const counterAccount = row[3];
    const code = row[4];
    const rawDirection = row[5];
    let direction;
    if (rawDirection === "Credit" || rawDirection === "Bij") {
      direction = true;
    } else if (rawDirection === "Debit" || rawDirection === "Af") {
      direction = false;
    } else {
      throw new Error(
        "Could not determine transaction direction based on value: " +
          rawDirection
      );
    }
    const amount = Number(row[6].replace(",", ".")) * utils.DECIMAL;
    const type = row[7];
    const description = row[8];
    let balanceAfter = undefined;
    if (row[9] !== undefined) {
      balanceAfter = Number(row[9].replace(",", ".")) * utils.DECIMAL;
    }
    const tag = row[10];

    return new INGTransaction(
      date,
      counterName,
      account,
      counterAccount,
      code,
      direction,
      amount,
      type,
      description,
      balanceAfter,
      tag
    );
  }

  /**
   * Loads transactions from data (coming from a transactions file).
   * @param {string} data - Transaction data in CSV format.
   * @return {Array<INGTransaction>} - The loaded transactions,
   *                                   sorted by date ascending.
   */
  static loadTransactions(data) {
    assert(typeof data === "string");
    const parsed = Papa.parse(data);
    if (parsed.errors.length !== 0) {
      const errorsJoined = parsed.errors
        .map((error) => JSON.stringify(error))
        .join("\n");
      throw new Error(
        "Errors while parsing transaction data:\n" + errorsJoined
      );
    }

    // Remove the first row (header).
    const rows = parsed.data.slice(1);
    const transactions = [];
    for (const row of rows) {
      if (row.length === 1 && row[0] === "") {
        // Empty line.
        continue;
      }

      transactions.push(INGTransaction.loadRow(row));
    }

    // Sort by date ascending.
    const sortedTransactions = transactions.sort((a, b) => a.date - b.date);

    return sortedTransactions;
  }
}

exports.INGTransaction = INGTransaction;
