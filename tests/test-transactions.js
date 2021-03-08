const fs = require("fs");

const INGTransaction = require("../src/js/lib/sources/ing").INGTransaction;
const transactions = require("../src/js/lib/transactions");
const Transaction = transactions.Transaction;
const Parameters = require("../src/js/lib/parameters").Parameters;
const DECIMAL = require("../src/js/lib/utils.js").DECIMAL;

describe("Transaction", function () {
  const transactionFilePath = "tests/data/test_transactions.csv";
  const parametersFilePath = "tests/data/test_parameters.json";

  const testParameters = Parameters.import(
    fs.readFileSync(parametersFilePath).toString()
  );

  it("can be constructed", function () {
    const transaction = new Transaction(
      new Date(2020, 6, 28),
      "Company Inc.",
      "NL01WORK0987654321",
      "Salary for June 2020",
      2000 * DECIMAL
    );

    expect(transaction.date).toEqual(new Date(2020, 6, 28));
    expect(transaction.counterName).toBe("Company Inc.");
    expect(transaction.counterAccount).toEqual("NL01WORK0987654321");
    expect(transaction.description).toEqual("Salary for June 2020");
    expect(transaction.change).toEqual(2000 * DECIMAL);
    expect(transaction.category).toEqual(null);

    const categorizedTransaction = new Transaction(
      new Date(2020, 6, 28),
      "Company Inc.",
      "NL01WORK0987654321",
      "Salary for June 2020",
      2000 * DECIMAL,
      "Salary"
    );

    expect(categorizedTransaction.date).toEqual(new Date(2020, 6, 28));
    expect(categorizedTransaction.counterName).toBe("Company Inc.");
    expect(categorizedTransaction.counterAccount).toEqual("NL01WORK0987654321");
    expect(categorizedTransaction.description).toEqual("Salary for June 2020");
    expect(categorizedTransaction.change).toEqual(2000 * DECIMAL);
    expect(categorizedTransaction.category).toEqual("Salary");
  });

  it("can be categorized", function () {
    const transactionData = fs.readFileSync(transactionFilePath).toString();
    const uncategorizedTransactions = INGTransaction.loadTransactions(
      transactionData
    ).map((tr) => tr.toTransaction());

    const categorizedTransactions = uncategorizedTransactions.map((tr) =>
      tr.categorize(testParameters.categories)
    );

    expect(categorizedTransactions).toEqual([
      new Transaction(
        new Date("2020-06-28"),
        "Company Inc.",
        "NL01WORK0987654321",
        "Bonus for June 2020",
        500 * DECIMAL,
        "Salary"
      ),
      new Transaction(
        new Date("2020-06-28"),
        "Company Inc.",
        "NL01WORK0987654321",
        "Salary for June 2020",
        2000 * DECIMAL,
        "Salary"
      ),
      new Transaction(
        new Date("2020-06-29"),
        "Mr. G",
        "NL00MAIN1234567890",
        "To Orange Savings Account ABC123456",
        -100 * DECIMAL,
        "Emergency"
      ),
      new Transaction(
        new Date("2020-07-01"),
        "Mr. G",
        "NL00MAIN1234567890",
        "To Orange Savings Account DEF999999",
        -200 * DECIMAL,
        "Loan"
      ),
      new Transaction(
        new Date("2020-07-12"),
        "bol.com b.v.",
        "NL00MAIN1234567890",
        "Name: bol.com b.v. Description: 90340932902 2492049402",
        -50 * DECIMAL,
        "Shopping"
      ),
    ]);
  });

  // TODO: Add test for transactionBalances
});
