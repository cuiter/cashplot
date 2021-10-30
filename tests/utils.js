const fs = require("fs");

const INGTransaction = require("../src/js/lib/sources/ing").INGTransaction;
const Parameters = require("../src/js/lib/parameters").Parameters;

const transactionFilePath = "tests/data/test_transactions.csv";
const parametersFilePath = "tests/data/test_parameters.json";

/**
 * @return {Parameters} Parameters that can be used for testing.
 */
exports.loadTestParameters = function () {
  return Parameters.import(fs.readFileSync(parametersFilePath).toString());
};
/**
 * @return {Array<Transaction>} Transactions that can be used for testing.
 */
exports.loadTestTransactions = function () {
  const transactionData = fs.readFileSync(transactionFilePath).toString();
  const uncategorizedTransactions = INGTransaction.loadTransactions(
    transactionData
  ).map((tr) => tr.toTransaction());

  return uncategorizedTransactions;
};
