import plotly.graph_objects as go
from cashplot.util import *
import datetime
from decimal import Decimal

def create_graph(transactions_bal):
    fig = go.Figure()

    draw_balances(fig, transactions_bal)
    draw_categories(fig, transactions_bal)

    return fig

def draw_balances(fig, transactions_bal):
    x = list(map(lambda tr : tr.date, transactions_bal))

    for account_name in transactions_bal[0].balances.keys():
        y = list(map(lambda tr : tr.balances[account_name], transactions_bal))

        fig.add_trace(go.Scatter(x=x, y=y, name=account_name))

def get_categories(transactions_bal):
    categories = set(map(lambda tr : tr.category, transactions_bal))
    for account_name in transactions_bal[0].balances.keys():
        if account_name in categories:
            categories.remove(account_name)
    return list(categories)

def floor_month(date):
    """Floors the given date down to the first of the month."""
    return datetime.datetime(date.year, date.month, 1).date()

def next_month(date):
    """Given a month, returns the next month"""
    if date.month < 12:
        return datetime.datetime(date.year, date.month + 1, 1).date()
    else:
        return datetime.datetime(date.year + 1, 1, 1).date()

def categories_changes(transactions_bal):
    categories = get_categories(transactions_bal)

    first_month = floor_month(transactions_bal[0].date)
    last_month = floor_month(transactions_bal[-1].date)

    changes = fill_dict(categories, [])

    months = []
    cur_month = first_month
    while cur_month <= last_month:
        cur_changes = fill_dict(categories, Decimal(0))
        for tr in transactions_bal:
            if floor_month(tr.date) == cur_month and tr.category in categories:
                cur_changes[tr.category] += tr.change
        for category in categories:
            changes[category].append(cur_changes[category])
        months.append(cur_month)
        cur_month = next_month(cur_month)

    return (months, changes)

def draw_categories(fig, transactions_bal):
    months, changes = categories_changes(transactions_bal)

    for category in changes.keys():
        fig.add_trace(go.Scatter(x=months, y=changes[category], name=category))
