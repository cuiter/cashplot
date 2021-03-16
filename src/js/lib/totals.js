const transactions = require("./transactions");
const assert = require("nanoassert");

const Period = {
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
function getCategories(trBalances) {
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
function lastYearRange(trBalances) {
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
 * For example, given July 23rd and Period.MONTH, floors it down to July 1st.
 *
 * @param {Date} date - The date.
 * @param {Period} period - The period.
 * @return {Date} The floored date.
 */
function floorPeriod(date, period) {
  assert(date instanceof Date);
  switch (period) {
    case Period.YEAR: {
      return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    }
    case Period.QUARTER: {
      return new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth() - (date.getUTCMonth() % 3),
          1
        )
      );
    }
    case Period.MONTH: {
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    }
    case Period.WEEK: {
      // https://stackoverflow.com/a/4156516
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day == 0 ? -6 : 1); // Adjust when day is sunday.
      return new Date(d.setDate(diff));
    }
    case Period.DAY: {
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
 * @param {Period} period - The period.
 * @return {Date} The first day in the next period.
 */
function nextPeriod(date, period) {
  assert(date instanceof Date);
  const floorDate = floorPeriod(date, period);
  switch (period) {
    case Period.YEAR: {
      return new Date(
        Date.UTC(
          floorDate.getUTCFullYear() + 1,
          floorDate.getUTCMonth(),
          floorDate.getUTCDate()
        )
      );
    }
    case Period.QUARTER: {
      return new Date(
        Date.UTC(
          floorDate.getUTCFullYear(),
          floorDate.getUTCMonth() + 3,
          floorDate.getUTCDate()
        )
      );
    }
    case Period.MONTH: {
      return new Date(
        Date.UTC(
          floorDate.getUTCFullYear(),
          floorDate.getUTCMonth() + 1,
          floorDate.getUTCDate()
        )
      );
    }
    case Period.WEEK: {
      return new Date(
        Date.UTC(
          floorDate.getUTCFullYear(),
          floorDate.getUTCMonth(),
          floorDate.getUTCDate() + 7
        )
      );
    }
    case Period.DAY: {
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
 * @param {Period} period - The period.
 * @return {Array<Date>} Dates of 1/3rd and 2/3rds through the period.
 */
function periodThirds(date, period) {}

/**
 * Given a date, return the date but half through the period.
 * @param {Date} date - The date.
 * @param {Period} period - The period.
 * @return {Array<Date>} Dates half through the period.
 */
function periodHalves(date, period) {}

/**
 * Calculate the period total income/expenses for each category occurring in the given transactions+balances.
 * @param {Array<TransactionBalance>} trBalances - The transactions+balances.
 * @param {Period} period - The period by which to group income/expenses by.
 * @return {Array.<Array<Date>,Object<string,number>,Object<string,number>>} -
 *   An array of periods, an array of income totals and an array of expenses totals.
 */
function categoriesChanges(trBalances, period) {}

exports.Period = Period;
exports.getCategories = getCategories;
exports.lastYearRange = lastYearRange;
exports.floorPeriod = floorPeriod;
exports.nextPeriod = nextPeriod;
exports.periodThirds = periodThirds;
exports.periodHalves = periodHalves;
exports.categoriesChanges = categoriesChanges;