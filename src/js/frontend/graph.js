/** @module */
import { INGTransaction } from "../lib/sources/ing.js";
import { transactionBalances } from "../lib/transactions.js";
import {
  Period,
  periodThirds,
  periodHalves,
  categoriesChanges,
} from "../lib/totals.js";
import { DECIMAL, interleaveArrays } from "../lib/utils.js";

const GRAPH_IDS = {
  BALANCE: "balance-graph",
  YEAR: "yearly-totals-graph",
  QUARTER: "quarterly-totals-graph",
  MONTH: "monthly-totals-graph",
  WEEK: "weekly-totals-graph",
};

const PERIOD_FORMATS = {
  [Period.YEAR]: "%Y",
  [Period.QUARTER]: "Q%q %Y",
  [Period.MONTH]: "%b %Y",
  [Period.WEEK]: "W%V %Y",
  [Period.DAY]: "%b %e, %Y",
};

const LAYOUT_OPTIONS = {
  margin: {
    l: 80,
    r: 20,
    b: 80,
    t: 0,
    pad: 0,
  },
  font: { size: 16 },
  legend: {
    orientation: "h",
    xanchor: "right",
    x: 1,
    y: 1,
  },
};
const RANGE_SELECTOR_OPTIONS = {
  buttons: [
    {
      step: "month",
      stepmode: "backward",
      count: 1,
      label: "1m",
    },
    {
      step: "month",
      stepmode: "backward",
      count: 6,
      label: "6m",
    },
    {
      step: "year",
      stepmode: "todate",
      count: 1,
      label: "YTD",
    },
    {
      step: "year",
      stepmode: "backward",
      count: 1,
      label: "1y",
    },
    {
      step: "all",
    },
  ],
};

/**
 * Generates graphs and updates the graph elements.
 * @param {Parameters} parameters - Input data including transactions.
 */
export function generateGraphs(parameters) {
  const uncategorizedTransactions = INGTransaction.loadTransactions(
    parameters.transactionData
  ).map((tr) => tr.toTransaction());
  const trBalances = transactionBalances(
    uncategorizedTransactions.map((tr) => tr.categorize(parameters.categories)),
    parameters.accounts
  );

  createBalanceGraph(trBalances, GRAPH_IDS["BALANCE"]);
  for (const periodName of Object.keys(Period)) {
    if (GRAPH_IDS[periodName] !== undefined) {
      createTotalsGraph(trBalances, Period[periodName], GRAPH_IDS[periodName]);
    }
  }
}

/**
 * Wrapper function around Plotly.newPlot / Plotly.react that creates a graph
 * if it doesn't already exist and updates it if it does.
 * @param {string} graphId - The element ID of the graph <div>.
 * @param {Object} data - The data to be plotted.
 * @param {Object} layout - Layout configuration.
 * @param {Object} config - Graph configuration.
 */
function plotGraph(graphId, data, layout, config) {
  if (document.getElementById(graphId).children.length === 0) {
    Plotly.newPlot(graphId, data, layout, config);
  } else {
    Plotly.react(graphId, data, layout, config);
  }
}

/**
 * Generates a balance graph.
 * @param {Array<TransactionBalance>} trBalances - Transactions+balances to plot.
 * @param {string} graphId - Id of the graph <div> element.
 */
function createBalanceGraph(trBalances, graphId) {
  const x = trBalances.map((tr) => tr.transaction.date);

  const data = [];
  for (const accountName of Object.keys(trBalances[0].balances)) {
    const y = trBalances
      .map((tr) => tr.balances[accountName])
      .map((amount) => amount / DECIMAL);

    const trace = {
      x: x,
      y: y,
      name: accountName,
      mode: "line",
      line: { shape: "hv" },
      type: "scattergl",
    };

    data.push(trace);
  }

  const layout = Object.assign(
    {
      xaxis: {
        rangeselector: RANGE_SELECTOR_OPTIONS,
      },
    },
    LAYOUT_OPTIONS
  );
  const config = { responsive: true };
  plotGraph(graphId, data, layout, config);
}

/**
 * Generates a totals graph.
 * @param {Array<TransactionBalance>} trBalances - Transactions+balances
 *                                                 from which to calculate the totals.
 * @param {Period} period - Period to group totals by.
 * @param {string} graphId - Id of the graph <div> element.
 */
function createTotalsGraph(trBalances, period, graphId) {
  const [periods, incomeChanges, expensesChanges] = categoriesChanges(
    trBalances,
    period
  );

  const thirdsPeriodDates = periods.map((p) => periodThirds(p, period));
  const incomePeriodDates = thirdsPeriodDates.map((p) => p[0]);
  const expensesPeriodDates = thirdsPeriodDates.map((p) => p[1]);

  const combinedPeriods = interleaveArrays(
    incomePeriodDates,
    expensesPeriodDates
  );

  const data = [];
  for (const category of Object.keys(incomeChanges)) {
    const combinedChanges = interleaveArrays(
      incomeChanges[category],
      expensesChanges[category]
    );

    const trace = {
      x: combinedPeriods,
      y: combinedChanges.map((amount) => amount / DECIMAL),
      name: category,
      type: "bar",
    };

    data.push(trace);
  }

  const layout = Object.assign(
    {
      barmode: "relative",
      xaxis: {
        rangeselector: period === Period.YEAR ? null : RANGE_SELECTOR_OPTIONS,
        tickmode: "array",
        tickvals: periods.map((p) => periodHalves(p, period)),
        tickformat: PERIOD_FORMATS[period],
      },
    },
    LAYOUT_OPTIONS
  );
  const config = { responsive: true };

  plotGraph(graphId, data, layout, config);
}

/**
 * Makes the graph elements update to the proper size.
 */
export function resizeGraphs() {
  setTimeout(() => {
    for (const graphId of Object.values(GRAPH_IDS)) {
      Plotly.relayout(graphId, { autosize: true });
    }
  }, 50);
}
