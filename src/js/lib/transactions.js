const assert = require("assert");
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
    assert.ok(utils.isValidDate(date));
    assert.equal(typeof counterName, "string");
    assert.equal(typeof counterAccount, "string");
    assert.equal(typeof description, "string");
    assert.ok(Number.isFinite(change));
    if (category !== null) {
      assert.equal(typeof category, "string");
    }

    this.date = date;
    this.counterName = counterName;
    this.counterAccount = counterAccount;
    this.description = description;
    this.change = change;
    this.category = category;
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
    assert.ok(transaction instanceof Transaction);
    assert.equal(typeof changes, "object");
    for (const account of Object.keys(changes)) {
      assert.ok(Number.isFinite(typeof changes[account]));
    }
    assert.equal(typeof balances, "object");
    for (const account of Object.keys(balances)) {
      assert.ok(Number.isFinite(typeof balances[account]));
    }

    this.transaction = transaction;
    this.changes = changes;
    this.balances = balances;
  }
}

/**
 * Categorize transactions based on matching rules in the configuration.
 * If no categories match a given transaction, throws an Error.
 *
 * @param {Array<Transaction>} transactions - The transactions to categorize.
 * @param {Array<Category>} categories - The category matching rules.
 * @return {Array<Transaction>} Categorized transactions.
 */
exports.categorize = function (transactions, categories) {
  assert.ok(Array.isArray(transactions));
  assert.ok(Array.isArray(categories));
  return transactions.map((transaction) => {
    assert(transaction instanceof Transaction);
  });
};

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
  assert.ok(Array.isArray(transactions));
  assert.ok(Array.isArray(accounts));
  return transactions.map((transaction) => {
    assert(transaction instanceof Transaction);
  });
};

exports.Transaction = Transaction;
exports.TransactionBalance = TransactionBalance;
