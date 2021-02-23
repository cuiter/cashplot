/**
 * Generates graphs and updates the graph elements.
 */
export function generateGraphs() {
  const trace1 = {
    x: [1, 2, 3, 4],
    y: [10, 15, 13, 17],
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

  Plotly.newPlot('balance-graph', data, layout, config);
}

/**
 * Makes the graph elements update to the proper size.
 */
export function resizeGraphs() {
  setTimeout(() => {
    Plotly.relayout('balance-graph', {autosize: true});
  }, 50);
}
