const graphIds = [
  'balance-graph', 'daily-totals-graph', 'weekly-totals-graph',
  'monthly-totals-graph', 'quarterly-totals-graph', 'yearly-totals-graph',
];

/**
 * Generates graphs and updates the graph elements.
 */
export function generateGraphs() {
  for (const graphId of graphIds) {
    const trace1 = {
      x: [1, 2, 3, 4],
      y: [Math.random() * 20, Math.random() * 20,
        Math.random() * 20, Math.random() * 20],
      mode: 'markers',
      type: 'scatter',
    };

    const trace2 = {
      x: [2, 3, 4, 5],
      y: [16, 5, 11, 9],
      mode: 'lines',
      type: 'scatter',
    };

    const trace3 = {
      x: [1, 2, 3, 4],
      y: [12, 9, 15, 12],
      mode: 'lines+markers',
      type: 'scatter',
    };

    const data = [trace1, trace2, trace3];

    const layout = {
      font: {size: 18},
    };
    const config = {responsive: true};
    Plotly.newPlot(graphId, data, layout, config);
  }
}

/**
 * Makes the graph elements update to the proper size.
 */
export function resizeGraphs() {
  setTimeout(() => {
    for (const graphId of graphIds) {
      Plotly.relayout(graphId, {autosize: true});
    }
  }, 50);
}
