const fs = require("fs");

const INGTransaction = require("../src/js/lib/sources/ing").INGTransaction;
const DECIMAL = require("../src/js/lib/utils.js").DECIMAL;

describe("INGTransaction", function () {
  const testRow = [
    "20200628",
    "Company Inc.",
    "NL00MAIN1234567890",
    "NL01WORK0987654321",
    "OV",
    "Credit",
    "2000",
    "Transfer",
    "Salary for June 2020",
    "2500",
    "",
  ];
  const transactionFilePath = "tests/data/test_transactions.csv";

  it("can be constructed", function () {
    const transaction = new INGTransaction(
      new Date(2020, 6, 28),
      "Company Inc.",
      "NL00MAIN1234567890",
      "NL01WORK0987654321",
      "OV",
      true,
      2000 * DECIMAL,
      "Transfer",
      "Salary for June 2020"
    );

    expect(transaction.date).toEqual(new Date(2020, 6, 28));
    expect(transaction.counterName).toBe("Company Inc.");
    expect(transaction.account).toEqual("NL00MAIN1234567890");
    expect(transaction.counterAccount).toEqual("NL01WORK0987654321");
    expect(transaction.code).toEqual("OV");
    expect(transaction.direction).toEqual(true);
    expect(transaction.amount).toEqual(2000 * DECIMAL);
    expect(transaction.type).toEqual("Transfer");
    expect(transaction.description).toEqual("Salary for June 2020");
    // Optional parameters default to null.
    expect(transaction.balanceAfter).toEqual(null);
    expect(transaction.tag).toEqual(null);
  });

  it("can be loaded from a parsed CSV row", function () {
    const transaction = INGTransaction.loadRow(testRow);

    expect(transaction).toEqual(
      new INGTransaction(
        new Date(2020, 6, 28),
        "Company Inc.",
        "NL00MAIN1234567890",
        "NL01WORK0987654321",
        "OV",
        true,
        2000 * DECIMAL,
        "Transfer",
        "Salary for June 2020",
        2500 * DECIMAL,
        ""
      )
    );
  });

  it("can be loaded from a transactions file", function () {
    const transactionData = fs.readFileSync(transactionFilePath).toString();

    const transactions = INGTransaction.loadTransactions(transactionData);
    expect(transactions).toEqual([
      new INGTransaction(
        new Date(2020, 6, 28),
        "Company Inc.",
        "NL00MAIN1234567890",
        "NL01WORK0987654321",
        "OV",
        true,
        2000 * DECIMAL,
        "Transfer",
        "Salary for June 2020"
      ),
      new INGTransaction(
        new Date(2020, 6, 28),
        "Company Inc.",
        "NL00MAIN1234567890",
        "NL01WORK0987654321",
        "OV",
        true,
        500 * DECIMAL,
        "Transfer",
        "Bonus for June 2020"
      ),
      new INGTransaction(
        new Date(2020, 6, 29),
        "Mr. G",
        "NL00MAIN1234567890",
        "NL00MAIN1234567890",
        "GT",
        false,
        100 * DECIMAL,
        "Online Banking",
        "To Orange Savings Account ABC123456"
      ),
      new INGTransaction(
        new Date(2020, 7, 1),
        "Mr. G",
        "NL00MAIN1234567890",
        "NL00MAIN1234567890",
        "GT",
        false,
        200 * DECIMAL,
        "Online Banking",
        "To Orange Savings Account DEF999999"
      ),
      new INGTransaction(
        new Date(2020, 7, 12),
        "bol.com b.v.",
        "NL27INGB0000026500",
        "NL00MAIN1234567890",
        "ID",
        false,
        50 * DECIMAL,
        "iDEAL",
        "Name: bol.com b.v. Description: 90340932902 2492049402"
      ),
    ]);
  });
});
