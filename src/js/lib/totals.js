/** @module */
const transactions = require("./transactions");
const utils = require("./utils");
const assert = require("nanoassert");

/** Enum denoting a span of time (YEAR/QUARTER/...). */
exports.Period = {
  YEAR: 1,
  QUARTER: 2,
  MONTH: 3,
  WEEK: 4,
  DAY: 5,
};

/**
 * @param {Array<TransactionBalance>} trBalances - Transactions+balances.
 * @return {Array<string>} All categories occurring in the transactions+balances.
 */
exports.getCategories = function(trBalances) {
  const accountNames = Object.keys(trBalances[0].balances);
  const isNotAnAccount = (category) => accountNames.indexOf(category) === -1;

  const rawCategories = trBalances.map((tr) => tr.transaction.category);
  // Remove duplicates and account names from categories.
  return [...new Set(rawCategories)].filter(isNotAnAccount);
}

/**
 * Calculate the date range from a year prior to the last transaction, to the last transaction.
 * @param {Array<TransactionBalance>} trBalances - Transactions+balances.
 * @return {Array.<Date, Date>} The dates.
 */
exports.lastYearRange = function(trBalances) {
  assert(Array.isArray(trBalances));
  assert(trBalances.length > 0);
  assert(
    trBalances.every((tr) => tr instanceof transactions.TransactionBalance)
  );
  const untilDate = trBalances[trBalances.length - 1].transaction.date;
  const afterDate = new Date(untilDate.valueOf());
  afterDate.setFullYear(afterDate.getFullYear() - 1);
  return [afterDate, untilDate];
}

/**
 * Floors the date to the first day in the given period.
 *
 * For example, given July 23rd and exports.Period.MONTH, floors it down to July 1st.
 *
 * @param {Date} date - The date.
 * @param {exports.Period} period - The period.
 * @return {Date} The floored date.
 */
exports.floorPeriod = function(date, period) {
  assert(date instanceof Date);
  switch (period) {
    case exports.Period.YEAR: {
      return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    }
    case exports.Period.QUARTER: {
      return new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth() - (date.getUTCMonth() % 3),
          1
        )
      );
    }
    case exports.Period.MONTH: {
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    }
    case exports.Period.WEEK: {
      // https://stackoverflow.com/a/4156516
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day == 0 ? -6 : 1); // Adjust when day is sunday.
      return new Date(d.setDate(diff));
    }
    case exports.Period.DAY: {
      return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      );
    }
    default: {
      throw new Error("Unknown period " + period);
    }
  }
}

/**
 * Given a date, return the first day of the next period.
 * @param {Date} date - The date.
 * @param {exports.Period} period - The period.
 * @return {Date} The first day in the next period.
 */
exports.nextPeriod = function(date, period) {
  assert(date instanceof Date);
  const floorDate = exports.floorPeriod(date, period);
  switch (period) {
    case exports.Period.YEAR: {
      return new Date(
        Date.UTC(
          floorDate.getUTCFullYear() + 1,
          floorDate.getUTCMonth(),
          floorDate.getUTCDate()
        )
      );
    }
    case exports.Period.QUARTER: {
      return new Date(
        Date.UTC(
          floorDate.getUTCFullYear(),
          floorDate.getUTCMonth() + 3,
          floorDate.getUTCDate()
        )
      );
    }
    case exports.Period.MONTH: {
      return new Date(
        Date.UTC(
          floorDate.getUTCFullYear(),
          floorDate.getUTCMonth() + 1,
          floorDate.getUTCDate()
        )
      );
    }
    case exports.Period.WEEK: {
      return new Date(
        Date.UTC(
          floorDate.getUTCFullYear(),
          floorDate.getUTCMonth(),
          floorDate.getUTCDate() + 7
        )
      );
    }
    case exports.Period.DAY: {
      return new Date(
        Date.UTC(
          floorDate.getUTCFullYear(),
          floorDate.getUTCMonth(),
          floorDate.getUTCDate() + 1
        )
      );
    }
    default: {
      throw new Error("Unknown period " + period);
    }
  }
}

/**
 * Given a date, return the dates of 1/3rd and 2/3rds through the period.
 * @param {Date} date - The date.
 * @param {exports.Period} period - The period.
 * @return {Array<Date>} Dates of 1/3rd and 2/3rds through the period.
 */
exports.periodThirds = function(date, period) {
  const fromDate = exports.floorPeriod(date, period);
  const untilDate = exports.nextPeriod(date, period);

  const oneThirdDate = new Date(
    fromDate.getTime() + (untilDate.getTime() - fromDate.getTime()) / 3
  );
  const twoThirdsDate = new Date(
    fromDate.getTime() + ((untilDate.getTime() - fromDate.getTime()) / 3) * 2
  );

  if (period == exports.Period.DAY) {
    return [oneThirdDate, twoThirdsDate];
  } else {
    return [
      new Date(
        Date.UTC(
          oneThirdDate.getUTCFullYear(),
          oneThirdDate.getUTCMonth(),
          oneThirdDate.getUTCDate()
        )
      ),
      new Date(
        Date.UTC(
          twoThirdsDate.getUTCFullYear(),
          twoThirdsDate.getUTCMonth(),
          twoThirdsDate.getUTCDate()
        )
      ),
    ];
  }
}

/**
 * Given a date, return the date but half through the period.
 * @param {Date} date - The date.
 * @param {exports.Period} period - The period.
 * @return {Array<Date>} Dates half through the period.
 */
exports.periodHalves = function(date, period) {
  const fromDate = exports.floorPeriod(date, period);
  const untilDate = exports.nextPeriod(date, period);

  const halfDate = new Date(
    fromDate.getTime() + (untilDate.getTime() - fromDate.getTime()) / 2
  );

  if (period == exports.Period.DAY) {
    return halfDate;
  } else {
    return new Date(
      Date.UTC(
        halfDate.getUTCFullYear(),
        halfDate.getUTCMonth(),
        halfDate.getUTCDate()
      )
    );
  }
}

/**
 * Calculate the period total income/expenses for each category occurring in the given transactions+balances.
 * @param {Array<TransactionBalance>} trBalances - The transactions+balances.
 * @param {exports.Period} period - The period by which to group income/expenses by.
 * @return {Array.<Array<Date>,Object<string,number>,Object<string,number>>} -
 *   An array of periods, an array of income totals and an array of expenses totals.
 */
exports.categoriesChanges = function(trBalances, period) {
  const categories = exports.getCategories(trBalances);

  const firstPeriod = exports.floorPeriod(trBalances[0].transaction.date, period);
  const lastPeriod = exports.floorPeriod(
    trBalances[trBalances.length - 1].transaction.date,
    period
  );

  const incomeChanges = utils.fillObject(categories, [], true);
  const expensesChanges = utils.fillObject(categories, [], true);

  const periods = [];
  let curPeriod = firstPeriod;

  while (curPeriod <= lastPeriod) {
    curIncomeChanges = utils.fillObject(categories, 0);
    curExpensesChanges = utils.fillObject(categories, 0);
    for (const trBalance of trBalances) {
      const tr = trBalance.transaction;
      if (
        exports.floorPeriod(tr.date, period).getTime() === curPeriod.getTime() &&
        categories.indexOf(tr.category) !== -1
      ) {
        if (tr.change >= 0) {
          curIncomeChanges[tr.category] += tr.change;
        } else {
          curExpensesChanges[tr.category] += -tr.change;
        }
      }
    }
    for (const category of categories) {
      incomeChanges[category].push(curIncomeChanges[category]);
      expensesChanges[category].push(curExpensesChanges[category]);
    }
    periods.push(curPeriod);
    curPeriod = exports.nextPeriod(curPeriod, period);
  }

  return [periods, incomeChanges, expensesChanges];
}
