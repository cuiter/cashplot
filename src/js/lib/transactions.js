/** @module */
const assert = require("nanoassert");
const utils = require("./utils");

const NET_ACCOUNT_NAME = "Net";

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
    for (const category of categories) {
      if (
        utils.match(this.description, category.descriptionPattern) &&
        utils.match(
          this.counterName + " " + this.counterAccount,
          category.counterAccountPattern
        )
      ) {
        categoryName = category.name;
        break;
      }
    }

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
      assert(Number.isFinite(changes[account]));
    }
    assert(typeof balances === "object");
    for (const account of Object.keys(balances)) {
      assert(Number.isFinite(balances[account]));
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
  assert(accounts.length > 0);

  const mainAccountName = accounts[0].name;

  /**
   * @return {Object} An object with the keys set to the account names and values set to 0.
   */
  function zeroAccounts() {
    const balances = {};
    for (const account of accounts) {
      balances[account.name] = 0;
    }
    return balances;
  }

  /**
   * @param {string} accountName - The account name to check.
   * @return {boolean} Whether an account doesn't contribute to the net total.
   */
  function isNetIgnoreAccount(accountName) {
    for (const account of accounts) {
      if (account.name === accountName && !account.addToNet) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {string} accountName - The account name to check.
   * @return {boolean} Whether an account is a savings account (i.e. not the first account).
   */
  function isSavingsAccount(accountName) {
    for (const account of accounts) {
      if (account.name === accountName) {
        return account.name !== mainAccountName;
      }
    }
    return false;
  }

  /**
   * @param {object} changes - The changes per account (account name => change objects).
   * @return {number} The total of the changes that contribute to the net value.
   *
   */
  function calculateNetChange(changes) {
    let netChange = 0;
    for (const accountName of Object.keys(changes)) {
      if (!isNetIgnoreAccount(accountName)) {
        netChange += changes[accountName];
      }
    }
    return netChange;
  }

  let oldBalances = zeroAccounts();
  for (const account of accounts) {
    oldBalances[account.name] = account.startingBalance;
  }
  const trBalances = [];

  for (const transaction of transactions) {
    const changes = zeroAccounts();

    changes[mainAccountName] = transaction.change;
    if (isSavingsAccount(transaction.category)) {
      changes[transaction.category] = -transaction.change;
    }

    const balances = zeroAccounts();
    for (const accountName of Object.keys(oldBalances)) {
      balances[accountName] = oldBalances[accountName] + changes[accountName];
    }

    // Deep-copy new balances to oldBalances.
    oldBalances = JSON.parse(JSON.stringify(balances));

    changes[NET_ACCOUNT_NAME] = calculateNetChange(changes);
    balances[NET_ACCOUNT_NAME] = calculateNetChange(balances);

    trBalances.push(new TransactionBalance(transaction, changes, balances));
  }

  return trBalances;
};

exports.Transaction = Transaction;
exports.TransactionBalance = TransactionBalance;
exports.NET_ACCOUNT_NAME = NET_ACCOUNT_NAME;
