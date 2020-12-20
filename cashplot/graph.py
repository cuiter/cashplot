import plotly.graph_objects as go
from plotly.subplots import make_subplots
from cashplot.util import *
import datetime
from decimal import Decimal

GRAPH_LAYOUT = {"rows": 2, "cols": 1}
BALANCE_GRAPH = {"row": 1, "col": 1}
CATEGORY_GRAPH = {"row": 2, "col": 1}


def create_graph(tr_balances):
    """Create a Plotly graph from the given transactions+balances."""
    fig = make_subplots(**GRAPH_LAYOUT,
                        subplot_titles=("Balance", "Monthly income/expenses"))

    draw_balances(fig, tr_balances)
    draw_categories(fig, tr_balances)

    # Zoom into the last year by default
    fig.update_xaxes(range=last_year_range(tr_balances))

    return fig


def draw_balances(fig, tr_balances):
    """Draw lines of the balances for each account."""
    x = list(map(lambda tr: tr.date, tr_balances))

    for account_name in tr_balances[0].balances.keys():
        y = list(map(lambda tr: tr.balances[account_name], tr_balances))

        fig.add_trace(go.Scatter(x=x, y=y, name=account_name), **BALANCE_GRAPH)


def draw_categories(fig, tr_balances):
    """Draw the monthly total income/expenses for each category."""
    months, changes = categories_changes(tr_balances)

    for category in changes.keys():
        fig.add_trace(go.Bar(x=months, y=changes[category], name=category), **CATEGORY_GRAPH)


def get_categories(tr_balances):
    """Return all categories occurring in the transactions+balances."""
    categories = set(map(lambda tr: tr.category, tr_balances))
    for account_name in tr_balances[0].balances.keys():
        if account_name in categories:
            categories.remove(account_name)
    return list(categories)


def floor_month(date):
    """Floor the given date down to the first of the month."""
    return datetime.datetime(date.year, date.month, 1).date()


def next_month(date):
    """Given a month, return the next month."""
    if date.month < 12:
        return datetime.datetime(date.year, date.month + 1, 1).date()
    else:
        return datetime.datetime(date.year + 1, 1, 1).date()


def categories_changes(tr_balances):
    """Calculate the monthly total for each category occurring in the given transactions+balances."""
    categories = get_categories(tr_balances)

    first_month = floor_month(tr_balances[0].date)
    last_month = floor_month(tr_balances[-1].date)

    changes = fill_dict(categories, [])

    months = []
    cur_month = first_month
    while cur_month <= last_month:
        cur_changes = fill_dict(categories, Decimal(0))
        for tr in tr_balances:
            if floor_month(tr.date) == cur_month and tr.category in categories:
                cur_changes[tr.category] += tr.change
        for category in categories:
            changes[category].append(cur_changes[category])
        months.append(cur_month)
        cur_month = next_month(cur_month)

    return (months, changes)

def last_year_range(tr_balances):
    """Calculate the date range from a year prior to the transaction, to the transaction"""
    last_date = tr_balances[-1].date
    last_year_date = datetime.datetime(last_date.year - 1, last_date.month, last_date.day).date()
    return [last_year_date, last_date]
