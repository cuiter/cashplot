from cashplot.util import *
import datetime
import calendar
from decimal import Decimal
from enum import Enum


class Period(Enum):
    YEAR = 1
    QUARTER = 2
    MONTH = 3
    WEEK = 4
    DAY = 5


def get_categories(tr_balances):
    """Return all categories occurring in the transactions+balances."""
    categories = set(map(lambda tr: tr.category, tr_balances))
    for account_name in tr_balances[0].balances.keys():
        if account_name in categories:
            categories.remove(account_name)
    return sorted(list(categories))


def floor_period(date, period):
    """Floor the given date down to the first of the period."""
    if period == Period.YEAR:
        return datetime.datetime(date.year, 1, 1).date()
    elif period == Period.QUARTER:
        return datetime.datetime(date.year, date.month - (date.month - 1) % 3, 1).date()
    elif period == Period.MONTH:
        return datetime.datetime(date.year, date.month, 1).date()
    elif period == Period.WEEK:
        year, week, day = date.isocalendar()
        return datetime.date.fromisocalendar(year, week, 1)
    elif period == Period.DAY:
        return date
    else:
        raise ValueError('unknown period type')


def next_period(date, period):
    """Given a date, return the first day of the next period."""
    # Make sure the date is the first of the current period.
    date = floor_period(date, period)
    if period == Period.YEAR:
        new_year = date.year + 1
        new_month = 1
        new_day = 1
    elif period == Period.QUARTER:
        new_year = date.year
        new_month = date.month + 3
        new_day = 1
    elif period == Period.MONTH:
        new_year = date.year
        new_month = date.month + 1
        new_day = 1
    elif period == Period.WEEK:
        new_year = date.year
        new_month = date.month
        new_day = date.day + 7
    elif period == Period.DAY:
        new_year = date.year
        new_month = date.month
        new_day = date.day + 1
    else:
        raise ValueError('unknown period type')

    if new_month > 12:
        new_year += 1
        new_month -= 12
    if new_day > calendar.monthrange(new_year, new_month)[1]:
        new_day -= calendar.monthrange(new_year, new_month)[1]
        new_month += 1
    if new_month > 12:
        new_year += 1
        new_month -= 12

    return datetime.datetime(new_year, new_month, new_day).date()


def period_thirds(date, period):
    """
    Given a date, return the dates of 1/3rds and 2/3rds through the period.

    NOTE: If period == Period.DAY, returns a datetime instead of a date
    """
    # Make sure the date is the first of the current period.
    date = floor_period(date, period)
    next_date = next_period(date, period)
    if period == Period.DAY:
        date = datetime.datetime(date.year, date.month, date.day)
        next_date = datetime.datetime(
            next_date.year, next_date.month, next_date.day)
    difference = next_date - date

    one_thirds = date + (difference / 3) * 1
    two_thirds = date + (difference / 3) * 2
    return (one_thirds, two_thirds)


def period_halves(date, period):
    """
    Given a date, return the date but half through the period.

    NOTE: If period == Period.DAY, returns a datetime instead of a date
    """
    # Make sure the date is the first of the current period.
    date = floor_period(date, period)
    next_date = next_period(date, period)
    if period == Period.DAY:
        date = datetime.datetime(date.year, date.month, date.day)
        next_date = datetime.datetime(
            next_date.year, next_date.month, next_date.day)
    difference = next_date - date

    return date + difference / 2


def override_thirds(dates, period):
    """Given the dates, return two lists of the dates but 1/3rds and 2/3rds through the period."""
    thirds = list(map(lambda date: period_thirds(date, period), dates))
    one_thirds = list(map(lambda thirds: thirds[0], thirds))
    two_thirds = list(map(lambda thirds: thirds[1], thirds))
    return one_thirds, two_thirds


def override_halves(dates, period):
    """Given the dates, return a lists of the dates but half through the period."""
    return list(map(lambda date: period_halves(date, period), dates))


def categories_changes(tr_balances, period):
    """Calculate the period total income/expenses for each category occurring in the given transactions+balances."""
    categories = get_categories(tr_balances)

    first_period = floor_period(tr_balances[0].date, period)
    last_period = floor_period(tr_balances[-1].date, period)

    income_changes = fill_dict(categories, [])
    expenses_changes = fill_dict(categories, [])

    periods = []
    cur_period = first_period
    while cur_period <= last_period:
        cur_income_changes = fill_dict(categories, Decimal(0))
        cur_expenses_changes = fill_dict(categories, Decimal(0))
        for tr in tr_balances:
            if floor_period(tr.date, period) == cur_period and tr.category in categories:
                if tr.change >= 0:
                    cur_income_changes[tr.category] += tr.change
                else:
                    cur_expenses_changes[tr.category] += -tr.change
        for category in categories:
            income_changes[category].append(cur_income_changes[category])
            expenses_changes[category].append(cur_expenses_changes[category])
        periods.append(cur_period)
        cur_period = next_period(cur_period, period)

    return (periods, income_changes, expenses_changes)


def last_year_range(tr_balances):
    """Calculate the date range from a year prior to the transaction, to the transaction"""
    last_date = tr_balances[-1].date
    last_year_date = datetime.datetime(
        last_date.year - 1, last_date.month, last_date.day).date()
    return [last_year_date, last_date]
