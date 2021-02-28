const assert = require("nanoassert");
const utils = require("./utils");

/**
 * A single transaction. May have a category assigned.
 */
class Transaction {
  /**
   * Creates a new Transaction instance.
   * @param {Date} date - The date on which the transaction was made.
   * @param {string} counterName - The name of the counter-account.
   * @param {string} counterAccount - The counter-account.
   * @param {string} description - Any additional information about the
   *                               transaction itself.
   * @param {number} change - The amount that was transferred. Negative if sent
   *                          from the main account, positive if received on
   *                          the main account.
   * @param {string} [category] - Category name.
   */
  constructor(
    date,
    counterName,
    counterAccount,
    description,
    change,
    category = null
  ) {
    assert(utils.isValidDate(date));
    assert(typeof counterName === "string");
    assert(typeof counterAccount === "string");
    assert(typeof description === "string");
    assert(Number.isFinite(change));
    if (category !== null) {
      assert(typeof category === "string");
    }

    this.date = date;
    this.counterName = counterName;
    this.counterAccount = counterAccount;
    this.description = description;
    this.change = change;
    this.category = category;
  }

  /**
   * Categorizes this transaction based on matching rules in the configuration.
   * Throws an Error if no categories match.
   *
   * @param {Array<Category>} categories - Category matching rules (see Parameters).
   * @return {Transaction} The categorized transaction.
   */
  categorize(categories) {
    assert(Array.isArray(categories));
    let categoryName = null;
    categories.map((category) => {
      if (
        this.description.match(new RegExp(category.descriptionPattern)) &&
        (this.counterName + " " + this.counterAccount).match(
          new RegExp(category.counterAccountPattern)
        )
      ) {
        categoryName = category.name;
      }
    });

    if (categoryName === null) {
      throw new Error("No categories matched.");
    } else {
      return new Transaction(
        this.date,
        this.counterName,
        this.counterAccount,
        this.description,
        this.change,
        categoryName
      );
    }
  }
}

/**
 * A transaction combined with changes and balances for each account.
 */
class TransactionBalance {
  /**
   * Creates a new TransactionBalance instance.
   * @param {Transaction} transaction - The transaction.
   * @param {Object<number>} changes - A collection of account name => balance
   *                                   change resulting from the transaction.
   * @param {Object<number>} balances - A collection of account name => balance
   *                                   resulting from the transaction.
   */
  constructor(transaction, changes, balances) {
    assert(transaction instanceof Transaction);
    assert(typeof changes === "object");
    for (const account of Object.keys(changes)) {
      assert(Number.isFinite(typeof changes[account]));
    }
    assert(typeof balances === "object");
    for (const account of Object.keys(balances)) {
      assert(Number.isFinite(typeof balances[account]));
    }

    this.transaction = transaction;
    this.changes = changes;
    this.balances = balances;
  }
}

/**
 * Calculate the changes and balances for every account on each transaction.
 * In addition, accumulates the changes from the accounts marked with addToNet
 * to the "Net" account.
 *
 * @param {Array<Transaction>} transactions - The categorized transactions.
 *                                            NOTE: Has to be sorted by date
 *                                                  ascending.
 * @param {Array<Account>} accounts - The account names and parameters.
 * @return {Array<TransactionBalance>} - The calculated
 *                                       transactions+changes+balances.
 */
exports.transactionBalances = function (transactions, accounts) {
  assert(Array.isArray(transactions));
  assert(Array.isArray(accounts));
  return transactions.map((transaction) => {
    assert(transaction instanceof Transaction);
  });
};

exports.Transaction = Transaction;
exports.TransactionBalance = TransactionBalance;
