import plotly.graph_objects as go
import plotly
from plotly.subplots import make_subplots
from cashplot.util import *
import datetime
from decimal import Decimal

GRAPH_LAYOUT = dict(rows=2, cols=1,
                    vertical_spacing=0.04,
                    shared_xaxes=True,
                    subplot_titles=("Balance", "Monthly income and expenses"))
BALANCE_GRAPH = dict(row=1, col=1)
CATEGORY_GRAPH = dict(row=2, col=1)


def create_graph(tr_balances):
    """Create a Plotly graph from the given transactions+balances."""
    fig = make_subplots(**GRAPH_LAYOUT)

    draw_balances(fig, tr_balances)
    months = draw_categories(fig, tr_balances)

    # Zoom into the last year by default.
    fig.update_xaxes(range=last_year_range(tr_balances))

    # Make the bars stack on top of each other
    # and place ticks on the start of each month.
    fig.update_layout(barmode="relative",
                      colorway=plotly.colors.qualitative.T10,
                      xaxis1=dict(
                          tickmode="array",
                          tickvals=months,
                      ),
                      xaxis2=dict(
                          tickmode="array",
                          tickvals=override_days(months, 15),
                          tickformat="%b %Y"
                      ))

    return fig


def draw_balances(fig, tr_balances):
    """Draw lines of the balances for each account."""
    x = list(map(lambda tr: tr.date, tr_balances))

    for account_name in tr_balances[0].balances.keys():
        y = list(map(lambda tr: tr.balances[account_name], tr_balances))

        fig.add_trace(go.Scatter(x=x, y=y, name=account_name,
                                 line_shape='hv'), **BALANCE_GRAPH)


def draw_categories(fig, tr_balances):
    """
    Draw the monthly total income/expenses for each category.

    Returns the months by which the monthly totals are grouped.
    """
    months, income_changes, expenses_changes = categories_changes(tr_balances)

    # Because of the way Plotly determines categories, we need to combine
    # the incomes and expenses into one dataset to avoid duplicate categories.

    # Shifts the dates by half a month so that the bar is drawn in the middle of the month.
    income_months = override_days(months, 9)
    expenses_months = override_days(months, 21)
    combined_months = interleave_lists(income_months, expenses_months)

    for category in income_changes.keys():
        combined_changes = interleave_lists(income_changes[category], expenses_changes[category])
        # Draws bar chart entries of the monthly income and expenses grouped by category.
        fig.add_trace(go.Bar(x=combined_months,
                             y=combined_changes, name=category),
                      **CATEGORY_GRAPH)

    return months


def get_categories(tr_balances):
    """Return all categories occurring in the transactions+balances."""
    categories = set(map(lambda tr: tr.category, tr_balances))
    for account_name in tr_balances[0].balances.keys():
        if account_name in categories:
            categories.remove(account_name)
    return sorted(list(categories))


def floor_month(date):
    """Floor the given date down to the first of the month."""
    return datetime.datetime(date.year, date.month, 1).date()


def next_month(date):
    """Given a month, return the next month."""
    if date.month < 12:
        return datetime.datetime(date.year, date.month + 1, 1).date()
    else:
        return datetime.datetime(date.year + 1, 1, 1).date()


def override_days(dates, day):
    """
    Return the given dates with its day set to the given day.
    """
    return list(map(lambda date: datetime.datetime(date.year, date.month, day).date(),
                    dates))


def categories_changes(tr_balances):
    """Calculate the monthly total income/expenses for each category occurring in the given transactions+balances."""
    categories = get_categories(tr_balances)

    first_month = floor_month(tr_balances[0].date)
    last_month = floor_month(tr_balances[-1].date)

    income_changes = fill_dict(categories, [])
    expenses_changes = fill_dict(categories, [])

    months = []
    cur_month = first_month
    while cur_month <= last_month:
        cur_income_changes = fill_dict(categories, Decimal(0))
        cur_expenses_changes = fill_dict(categories, Decimal(0))
        for tr in tr_balances:
            if floor_month(tr.date) == cur_month and tr.category in categories:
                if tr.change >= 0:
                    cur_income_changes[tr.category] += tr.change
                else:
                    cur_expenses_changes[tr.category] += -tr.change
        for category in categories:
            income_changes[category].append(cur_income_changes[category])
            expenses_changes[category].append(cur_expenses_changes[category])
        months.append(cur_month)
        cur_month = next_month(cur_month)

    return (months, income_changes, expenses_changes)


def last_year_range(tr_balances):
    """Calculate the date range from a year prior to the transaction, to the transaction"""
    last_date = tr_balances[-1].date
    last_year_date = datetime.datetime(
        last_date.year - 1, last_date.month, last_date.day).date()
    return [last_year_date, last_date]
