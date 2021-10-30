const fs = require("fs");

const INGTransaction = require("../src/js/lib/sources/ing").INGTransaction;
const transactions = require("../src/js/lib/transactions");
const Transaction = transactions.Transaction;
const TransactionBalance = transactions.TransactionBalance;
const Parameters = require("../src/js/lib/parameters").Parameters;
const DECIMAL = require("../src/js/lib/utils").DECIMAL;

const testUtils = require("./utils");

describe("Transaction", function () {
  it("can be constructed", function () {
    const transaction = new Transaction(
      new Date("2020-06-28"),
      "Company Inc.",
      "NL01WORK0987654321",
      "Salary for June 2020",
      2000 * DECIMAL
    );

    expect(transaction.date).toEqual(new Date("2020-06-28"));
    expect(transaction.counterName).toBe("Company Inc.");
    expect(transaction.counterAccount).toEqual("NL01WORK0987654321");
    expect(transaction.description).toEqual("Salary for June 2020");
    expect(transaction.change).toEqual(2000 * DECIMAL);
    expect(transaction.category).toEqual(null);

    const categorizedTransaction = new Transaction(
      new Date("2020-06-28"),
      "Company Inc.",
      "NL01WORK0987654321",
      "Salary for June 2020",
      2000 * DECIMAL,
      "Salary"
    );

    expect(categorizedTransaction.date).toEqual(new Date("2020-06-28"));
    expect(categorizedTransaction.counterName).toBe("Company Inc.");
    expect(categorizedTransaction.counterAccount).toEqual("NL01WORK0987654321");
    expect(categorizedTransaction.description).toEqual("Salary for June 2020");
    expect(categorizedTransaction.change).toEqual(2000 * DECIMAL);
    expect(categorizedTransaction.category).toEqual("Salary");
  });

  it("can be categorized", function () {
    const testParameters = testUtils.loadTestParameters();
    const uncategorizedTransactions = testUtils.loadTestTransactions();
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

  it("can be categorized to a default when no rules match", function () {
    const transaction = new Transaction(
      new Date("2020-06-28"),
      "Company Inc.",
      "NL01WORK0987654321",
      "Bonus for June 2020",
      500 * DECIMAL
    );
    // Don't pass any matching rules. It should fall back to the default.
    const categorizedTransaction = transaction.categorize(
      [],
      "Default Category"
    );

    expect(categorizedTransaction.category).toBe("Default Category");
  });
});

describe("TransactionBalance", function () {
  it("can be constructed", function () {
    const transaction = new Transaction(
      new Date("2020-06-28"),
      "Company Inc.",
      "NL01WORK0987654321",
      "Salary for June 2020",
      2000 * DECIMAL
    );
    const transactionBalance = new TransactionBalance(
      transaction,
      { Main: 2000 * DECIMAL, Loan: 0 },
      { Main: 0, Loan: 50 * DECIMAL }
    );

    expect(transactionBalance.transaction.date).toEqual(new Date("2020-06-28"));
    expect(transactionBalance.transaction.counterName).toBe("Company Inc.");
    expect(transactionBalance.transaction.counterAccount).toEqual(
      "NL01WORK0987654321"
    );
    expect(transactionBalance.transaction.description).toEqual(
      "Salary for June 2020"
    );
    expect(transactionBalance.transaction.change).toEqual(2000 * DECIMAL);
    expect(transactionBalance.transaction.category).toEqual(null);
    expect(transactionBalance.changes["Main"]).toEqual(2000 * DECIMAL);
    expect(transactionBalance.changes["Loan"]).toEqual(0);
    expect(transactionBalance.balances["Main"]).toEqual(0);
    expect(transactionBalance.balances["Loan"]).toEqual(50 * DECIMAL);
  });

  it("can be calculated from a list of transactions", function () {
    const testParameters = testUtils.loadTestParameters();
    const uncategorizedTransactions = testUtils.loadTestTransactions();
    const categorizedTransactions = uncategorizedTransactions.map((tr) =>
      tr.categorize(testParameters.categories)
    );
    const transactionBalances = transactions.transactionBalances(
      categorizedTransactions,
      testParameters.accounts
    );

    expect(transactionBalances).toEqual([
      new TransactionBalance(
        new Transaction(
          new Date("2020-06-28"),
          "Company Inc.",
          "NL01WORK0987654321",
          "Bonus for June 2020",
          500 * DECIMAL,
          "Salary"
        ),
        {
          Main: 500 * DECIMAL,
          Emergency: 0 * DECIMAL,
          Loan: 0 * DECIMAL,
          [transactions.NET_ACCOUNT_NAME]: 500 * DECIMAL,
        },
        {
          Main: 500 * DECIMAL,
          Emergency: 0 * DECIMAL,
          Loan: 0.5 * DECIMAL,
          [transactions.NET_ACCOUNT_NAME]: 500 * DECIMAL,
        }
      ),
      new TransactionBalance(
        new Transaction(
          new Date("2020-06-28"),
          "Company Inc.",
          "NL01WORK0987654321",
          "Salary for June 2020",
          2000 * DECIMAL,
          "Salary"
        ),
        {
          Main: 2000 * DECIMAL,
          Emergency: 0 * DECIMAL,
          Loan: 0 * DECIMAL,
          [transactions.NET_ACCOUNT_NAME]: 2000 * DECIMAL,
        },
        {
          Main: 2500 * DECIMAL,
          Emergency: 0 * DECIMAL,
          Loan: 0.5 * DECIMAL,
          [transactions.NET_ACCOUNT_NAME]: 2500 * DECIMAL,
        }
      ),
      new TransactionBalance(
        new Transaction(
          new Date("2020-06-29"),
          "Mr. G",
          "NL00MAIN1234567890",
          "To Orange Savings Account ABC123456",
          -100 * DECIMAL,
          "Emergency"
        ),
        {
          Main: -100 * DECIMAL,
          Emergency: 100 * DECIMAL,
          Loan: 0 * DECIMAL,
          [transactions.NET_ACCOUNT_NAME]: 0 * DECIMAL,
        },
        {
          Main: 2400 * DECIMAL,
          Emergency: 100 * DECIMAL,
          Loan: 0.5 * DECIMAL,
          [transactions.NET_ACCOUNT_NAME]: 2500 * DECIMAL,
        }
      ),
      new TransactionBalance(
        new Transaction(
          new Date("2020-07-01"),
          "Mr. G",
          "NL00MAIN1234567890",
          "To Orange Savings Account DEF999999",
          -200 * DECIMAL,
          "Loan"
        ),
        {
          Main: -200 * DECIMAL,
          Emergency: 0 * DECIMAL,
          Loan: 200 * DECIMAL,
          [transactions.NET_ACCOUNT_NAME]: -200 * DECIMAL,
        },
        {
          Main: 2200 * DECIMAL,
          Emergency: 100 * DECIMAL,
          Loan: 200.5 * DECIMAL,
          [transactions.NET_ACCOUNT_NAME]: 2300 * DECIMAL,
        }
      ),
      new TransactionBalance(
        new Transaction(
          new Date("2020-07-12"),
          "bol.com b.v.",
          "NL00MAIN1234567890",
          "Name: bol.com b.v. Description: 90340932902 2492049402",
          -50 * DECIMAL,
          "Shopping"
        ),
        {
          Main: -50 * DECIMAL,
          Emergency: 0 * DECIMAL,
          Loan: 0 * DECIMAL,
          [transactions.NET_ACCOUNT_NAME]: -50 * DECIMAL,
        },
        {
          Main: 2150 * DECIMAL,
          Emergency: 100 * DECIMAL,
          Loan: 200.5 * DECIMAL,
          [transactions.NET_ACCOUNT_NAME]: 2250 * DECIMAL,
        }
      ),
    ]);
  });
});
