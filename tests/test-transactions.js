const transactions = require("../src/js/lib/transactions");
const Transaction = transactions.Transaction;
const DECIMAL = require("../src/js/lib/utils.js").DECIMAL;

describe("Transaction", function () {
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
    const uncategorizedTransactions = [
      new Transaction(
        new Date(2020, 6, 28),
        "Company Inc.",
        "NL01WORK0987654321",
        "Salary for June 2020",
        2000 * DECIMAL
      ),
      new Transaction(
        new Date(2020, 7, 12),
        "bol.com b.v.",
        "NL02BOLC8899001122",
        "Name: bol.com b.v. Description: 90340932902 2492049402",
        -50 * DECIMAL
      ),
    ];
    const categories = [
      {
        name: "Salary",
        descriptionPattern: "Salary",
        counterAccountPattern: "Company Inc",
      },
      {
        name: "Shopping",
        descriptionPattern: "",
        counterAccountPattern: "bol\\.com",
      },
      { name: "Other", descriptionPattern: "", counterAccountPattern: "" },
    ];

    const categorizedTransactions = transactions.categorize(
      uncategorizedTransactions,
      categories
    );

    expect(categorizedTransactions).toEqual([
      new Transaction(
        new Date(2020, 6, 28),
        "Company Inc.",
        "NL01WORK0987654321",
        "Salary for June 2020",
        2000 * DECIMAL,
        "Salary"
      ),
      new Transaction(
        new Date(2020, 7, 12),
        "bol.com b.v.",
        "NL02BOLC8899001122",
        "Name: bol.com b.v. Description: 90340932902 2492049402",
        -50 * DECIMAL,
        "Shopping"
      ),
    ]);
  });

  // TODO: Add test for transactionBalances
});
