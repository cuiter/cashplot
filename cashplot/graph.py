import plotly.graph_objects as go
import plotly
from plotly.subplots import make_subplots
import datetime
from decimal import Decimal
from cashplot.util import *
from cashplot.totals import last_year_range, categories_changes, override_halves, override_thirds, Period

GRAPH_LAYOUT = dict(rows=2, cols=1,
                    vertical_spacing=0.04,
                    shared_xaxes=True,
                    subplot_titles=("Balance", "Income and expenses"))
BALANCE_GRAPH = dict(row=1, col=1)
CATEGORY_GRAPH = dict(row=2, col=1)

PERIOD_FORMATS = {
    Period.YEAR: "%Y",
    Period.QUARTER: "Q%q %Y",
    Period.MONTH: "%b %Y",
    Period.WEEK: "W%V %Y",
    Period.DAY: "%b %e, %Y",
}


def create_graph(tr_balances, period):
    """Create a Plotly graph from the given transactions+balances."""
    fig = make_subplots(**GRAPH_LAYOUT)

    draw_balances(fig, tr_balances)
    periods = draw_categories(fig, tr_balances, period)

    # Zoom into the last year by default.
    fig.update_xaxes(range=last_year_range(tr_balances))

    # Make the bars stack on top of each other
    # and place ticks on the start of each month.
    fig.update_layout(barmode="relative",
                      colorway=plotly.colors.qualitative.T10,
                      xaxis1=dict(
                          tickmode="array",
                          tickvals=periods,
                      ),
                      xaxis2=dict(
                          tickmode="array",
                          tickvals=override_halves(periods, period),
                          tickformat=PERIOD_FORMATS[period]
                      ))

    return fig


def draw_balances(fig, tr_balances):
    """Draw lines of the balances for each account."""
    x = list(map(lambda tr: tr.date, tr_balances))

    for account_name in tr_balances[0].balances.keys():
        y = list(map(lambda tr: tr.balances[account_name], tr_balances))

        fig.add_trace(go.Scatter(x=x, y=y, name=account_name,
                                 line_shape='hv'), **BALANCE_GRAPH)


def draw_categories(fig, tr_balances, period):
    """
    Draw the monthly total income/expenses for each category.

    Returns the months by which the monthly totals are grouped.
    """
    periods, income_changes, expenses_changes = categories_changes(
        tr_balances, period)

    # Because of the way Plotly determines categories, we need to combine
    # the incomes and expenses into one dataset to avoid duplicate categories.

    # Shifts the dates by half a month so that the bar is drawn in the middle of the month.
    income_periods, expenses_periods = override_thirds(periods, period)
    combined_periods = interleave_lists(income_periods, expenses_periods)

    for category in income_changes.keys():
        combined_changes = interleave_lists(
            income_changes[category], expenses_changes[category])
        # Draws bar chart entries of the monthly income and expenses grouped by category.
        fig.add_trace(go.Bar(x=combined_periods,
                             y=combined_changes, name=category),
                      **CATEGORY_GRAPH)

    return periods
