const fs = require("fs");

const INGTransaction = require("../src/js/lib/sources/ing").INGTransaction;
const transactions = require("../src/js/lib/transactions");
const Parameters = require("../src/js/lib/parameters").Parameters;
const totals = require("../src/js/lib/totals");

const transactionFilePath = "tests/data/test_transactions.csv";
const parametersFilePath = "tests/data/test_parameters.json";

/**
 * @return {Parameters} Parameters that can be used for testing.
 */
function getTestParameters() {
  return Parameters.import(fs.readFileSync(parametersFilePath).toString());
}
/**
 * @return {Array<Transaction>} Transactions that can be used for testing.
 */
function getTestTransactions() {
  const transactionData = fs.readFileSync(transactionFilePath).toString();
  const uncategorizedTransactions = INGTransaction.loadTransactions(
    transactionData
  ).map((tr) => tr.toTransaction());

  return uncategorizedTransactions;
}

describe("Totals", function () {
  const testParameters = getTestParameters();
  const testTransactions = getTestTransactions();
  const testTrBalances = transactions.transactionBalances(
    testTransactions.map((tr) => tr.categorize(testParameters.categories)),
    testParameters.accounts
  );

  it("can determine categories", function () {
    expect(totals.getCategories(testTrBalances)).toEqual([
      "Salary",
      "Shopping",
    ]);
  });

  it("can generate a year-long range up to the last transaction", function () {
    expect(totals.lastYearRange(testTrBalances)).toEqual([
      new Date("2019-07-12"),
      new Date("2020-07-12"),
    ]);
  });

  it("can floor a date to the first day of a period", function () {
    expect(
      totals.floorPeriod(new Date("2020-05-20"), totals.Period.YEAR)
    ).toEqual(new Date("2020-01-01"));
    expect(
      totals.floorPeriod(new Date("2200-12-31"), totals.Period.YEAR)
    ).toEqual(new Date("2200-01-01"));
    expect(
      totals.floorPeriod(new Date("2000-01-01"), totals.Period.YEAR)
    ).toEqual(new Date("2000-01-01"));

    expect(
      totals.floorPeriod(new Date("2020-05-20"), totals.Period.QUARTER)
    ).toEqual(new Date("2020-04-01"));
    expect(
      totals.floorPeriod(new Date("2200-12-31"), totals.Period.QUARTER)
    ).toEqual(new Date("2200-10-01"));
    expect(
      totals.floorPeriod(new Date("2000-01-01"), totals.Period.QUARTER)
    ).toEqual(new Date("2000-01-01"));

    expect(
      totals.floorPeriod(new Date("2020-05-20"), totals.Period.MONTH)
    ).toEqual(new Date("2020-05-01"));
    expect(
      totals.floorPeriod(new Date("2200-12-31"), totals.Period.MONTH)
    ).toEqual(new Date("2200-12-01"));
    expect(
      totals.floorPeriod(new Date("2000-01-01"), totals.Period.MONTH)
    ).toEqual(new Date("2000-01-01"));

    expect(
      totals.floorPeriod(new Date("2020-05-20"), totals.Period.WEEK)
    ).toEqual(new Date("2020-05-18"));
    expect(
      totals.floorPeriod(new Date("2200-12-31"), totals.Period.WEEK)
    ).toEqual(new Date("2200-12-29"));
    expect(
      totals.floorPeriod(new Date("2000-01-01"), totals.Period.WEEK)
    ).toEqual(new Date("1999-12-27"));

    expect(
      totals.floorPeriod(new Date("2020-05-20"), totals.Period.DAY)
    ).toEqual(new Date("2020-05-20"));
    expect(
      totals.floorPeriod(new Date("2200-12-31"), totals.Period.DAY)
    ).toEqual(new Date("2200-12-31"));
    expect(
      totals.floorPeriod(new Date("2000-01-01"), totals.Period.DAY)
    ).toEqual(new Date("2000-01-01"));
  });

  it("can calculate the first day of the next period", function () {
    expect(
      totals.nextPeriod(new Date("2020-05-20"), totals.Period.YEAR)
    ).toEqual(new Date("2021-01-01"));
    expect(
      totals.nextPeriod(new Date("2200-12-31"), totals.Period.YEAR)
    ).toEqual(new Date("2201-01-01"));
    expect(
      totals.nextPeriod(new Date("2000-01-01"), totals.Period.YEAR)
    ).toEqual(new Date("2001-01-01"));

    expect(
      totals.nextPeriod(new Date("2020-05-20"), totals.Period.QUARTER)
    ).toEqual(new Date("2020-07-01"));
    expect(
      totals.nextPeriod(new Date("2200-12-31"), totals.Period.QUARTER)
    ).toEqual(new Date("2201-01-01"));
    expect(
      totals.nextPeriod(new Date("2000-01-01"), totals.Period.QUARTER)
    ).toEqual(new Date("2000-04-01"));

    expect(
      totals.nextPeriod(new Date("2020-05-20"), totals.Period.MONTH)
    ).toEqual(new Date("2020-06-01"));
    expect(
      totals.nextPeriod(new Date("2200-12-31"), totals.Period.MONTH)
    ).toEqual(new Date("2201-01-01"));
    expect(
      totals.nextPeriod(new Date("2000-01-01"), totals.Period.MONTH)
    ).toEqual(new Date("2000-02-01"));

    expect(
      totals.nextPeriod(new Date("2020-05-20"), totals.Period.WEEK)
    ).toEqual(new Date("2020-05-25"));
    expect(
      totals.nextPeriod(new Date("2200-12-31"), totals.Period.WEEK)
    ).toEqual(new Date("2201-01-05"));
    expect(
      totals.nextPeriod(new Date("2000-01-01"), totals.Period.WEEK)
    ).toEqual(new Date("2000-01-03"));

    expect(
      totals.nextPeriod(new Date("2020-05-20"), totals.Period.DAY)
    ).toEqual(new Date("2020-05-21"));
    expect(
      totals.nextPeriod(new Date("2200-12-31"), totals.Period.DAY)
    ).toEqual(new Date("2201-01-01"));
    expect(
      totals.nextPeriod(new Date("2000-01-01"), totals.Period.DAY)
    ).toEqual(new Date("2000-01-02"));
  });

  it("can calculate the dates 1/3rd and 2/3rds through a period", function () {
    expect(
      totals.periodThirds(new Date("2020-05-01"), totals.Period.YEAR)
    ).toEqual([new Date("2020-05-02"), new Date("2020-09-01")]);
    expect(
      totals.periodThirds(new Date("2020-05-01"), totals.Period.QUARTER)
    ).toEqual([new Date("2020-05-01"), new Date("2020-05-31")]);
    expect(
      totals.periodThirds(new Date("2020-05-01"), totals.Period.MONTH)
    ).toEqual([new Date("2020-05-11"), new Date("2020-05-21")]);
    expect(
      totals.periodThirds(new Date("2020-05-01"), totals.Period.WEEK)
    ).toEqual([new Date("2020-04-29"), new Date("2020-05-01")]);
    expect(
      totals.periodThirds(new Date("2020-05-01"), totals.Period.DAY)
    ).toEqual([new Date("2020-05-01 08:00Z"), new Date("2020-05-01 16:00Z")]);
  });

  it("can calculate the dates half through a period", function () {
    expect(
      totals.periodHalves(new Date("2020-05-01"), totals.Period.YEAR)
    ).toEqual(new Date("2020-07-02"));
    expect(
      totals.periodHalves(new Date("2020-05-01"), totals.Period.QUARTER)
    ).toEqual(new Date("2020-05-16"));
    expect(
      totals.periodHalves(new Date("2020-05-01"), totals.Period.MONTH)
    ).toEqual(new Date("2020-05-16"));
    expect(
      totals.periodHalves(new Date("2020-05-01"), totals.Period.WEEK)
    ).toEqual(new Date("2020-04-30"));
    expect(
      totals.periodHalves(new Date("2020-05-01"), totals.Period.DAY)
    ).toEqual(new Date("2020-05-01 12:00Z"));
  });

  // TODO: add tests for categoriesChanges
});
