const { categoriesChanges, periodThirds } = require("./totals");
const utils = require("./utils");

exports.calculateTotals = function (trBalances, period) {
  const [periods, incomeChanges, expensesChanges] = categoriesChanges(
    trBalances,
    period
  );

  const thirdsPeriodDates = periods.map((p) => periodThirds(p, period));
  const incomePeriodDates = thirdsPeriodDates.map((p) => p[0]);
  const expensesPeriodDates = thirdsPeriodDates.map((p) => p[1]);

  const combinedPeriods = utils.interleaveArrays(
    incomePeriodDates,
    expensesPeriodDates
  );

  const data = [];
  for (const category of Object.keys(incomeChanges)) {
    const combinedChanges = utils.interleaveArrays(
      incomeChanges[category],
      expensesChanges[category]
    );

    const trace = {
      x: combinedPeriods,
      y: combinedChanges.map((amount) => amount / utils.DECIMAL),
      name: category,
      type: "bar",
    };

    data.push(trace);
  }

  return [data, periods];
};
