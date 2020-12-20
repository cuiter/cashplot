import plotly.graph_objects as go
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

        fig.add_trace(go.Scatter(x=x, y=y, name=account_name, line_shape='hv'), **BALANCE_GRAPH)

def draw_categories(fig, tr_balances):
    """
    Draw the monthly total income/expenses for each category.

    Returns the months by which the monthly totals are grouped.
    """
    months, changes = categories_changes(tr_balances)
    income_months, income_changes, expenses_months, expenses_changes = categories_income_expenses(months, changes)


    for category in changes.keys():
        # Draws bar chart entries of the monthly income and expenses grouped by category.
        # Shifts the dates by half a month so that the bar is drawn in the middle of the month.
        fig.add_trace(go.Bar(x=override_days(income_months[category], 9),
                             y=income_changes[category], name=category),
                      **CATEGORY_GRAPH)
        fig.add_trace(go.Bar(x=override_days(expenses_months[category], 21),
                             y=expenses_changes[category], name=category),
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


def categories_income_expenses(months, changes):
    """
    Split the category monthly totals into income and expenses.

    NOTE: This flips the sign of the expenses so they are always positive.
    Returns dictionaries of X (month) and Y (change) values indexed by category.
    """
    income_months = {}
    income_changes = {}
    expenses_months = {}
    expenses_changes = {}

    for category in changes.keys():
        cat_changes = changes[category]
        cat_income_months = []
        cat_income_changes = []
        cat_expenses_months = []
        cat_expenses_changes = []

        for i in range(0, len(months)):
            if cat_changes[i] < Decimal(0):
                cat_expenses_months.append(months[i])
                cat_expenses_changes.append(-cat_changes[i])
            elif cat_changes[i] > Decimal(0):
                cat_income_months.append(months[i])
                cat_income_changes.append(cat_changes[i])

        income_months[category] = cat_income_months
        income_changes[category] = cat_income_changes
        expenses_months[category] = cat_expenses_months
        expenses_changes[category] = cat_expenses_changes

    return (income_months, income_changes, expenses_months, expenses_changes)


def last_year_range(tr_balances):
    """Calculate the date range from a year prior to the transaction, to the transaction"""
    last_date = tr_balances[-1].date
    last_year_date = datetime.datetime(last_date.year - 1, last_date.month, last_date.day).date()
    return [last_year_date, last_date]
