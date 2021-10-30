const calculateTotals = require("../src/js/lib/graph-data").calculateTotals;
const transactions = require("../src/js/lib/transactions");
const totals = require("../src/js/lib/totals");
const testUtils = require("./utils");

describe("Graph data", function () {
  it("totals can be calculated", function () {
    const testParameters = testUtils.loadTestParameters();
    const uncategorizedTransactions = testUtils.loadTestTransactions();
    const categorizedTransactions = uncategorizedTransactions.map((tr) =>
      tr.categorize(testParameters.categories)
    );
    const transactionBalances = transactions.transactionBalances(
      categorizedTransactions,
      testParameters.accounts
    );

    const [data, periods] = calculateTotals(
      transactionBalances,
      totals.Period.YEAR
    );

    expect(data[0]).toEqual({
      x: [new Date("2020-05-02"), new Date("2020-09-01")],
      y: [2500, 0],
      name: "Salary",
      type: "bar",
    });
    expect(data[data.length - 1]).toEqual({
      x: [new Date("2020-05-02"), new Date("2020-09-01")],
      y: [0, 50],
      name: "Shopping",
      type: "bar",
    });
  });
});
