from cashplot.totals import *
from cashplot.transactions import TransactionBalance, transaction_balances, categorize
from cashplot.sources.ing import load_ing_transactions
from cashplot.config import Config

with open("tests/data/test_config.json", "r") as cfp:
    config = Config.loads(cfp.read())
with open("tests/data/test_transactions.csv", "r") as tfp:
    transactions_uncategorized = list(
        map(lambda tr: tr.convert(), load_ing_transactions(tfp)))
    tr_balances = transaction_balances(categorize(
        transactions_uncategorized, config), config)


def test_get_categories():
    assert get_categories(tr_balances) == ['Salary', 'Shopping']


def test_last_year_range():
    ly_range = last_year_range(tr_balances)
    assert ly_range == [datetime.date(2019, 7, 12), datetime.date(2020, 7, 12)]


def test_floor_period():
    assert floor_period(datetime.datetime(2020, 5, 20).date(), Period.YEAR
                       ) == datetime.datetime(2020, 1, 1).date()
    assert floor_period(datetime.datetime(2200, 12, 31).date(), Period.YEAR
                       ) == datetime.datetime(2200, 1, 1).date()
    assert floor_period(datetime.datetime(2000, 1, 1).date(), Period.YEAR
                       ) == datetime.datetime(2000, 1, 1).date()

    assert floor_period(datetime.datetime(2020, 5, 20).date(), Period.QUARTER
                       ) == datetime.datetime(2020, 4, 1).date()
    assert floor_period(datetime.datetime(2200, 12, 31).date(), Period.QUARTER
                       ) == datetime.datetime(2200, 10, 1).date()
    assert floor_period(datetime.datetime(2000, 1, 1).date(), Period.QUARTER
                       ) == datetime.datetime(2000, 1, 1).date()

    assert floor_period(datetime.datetime(2020, 5, 20).date(), Period.MONTH
                       ) == datetime.datetime(2020, 5, 1).date()
    assert floor_period(datetime.datetime(2200, 12, 31).date(), Period.MONTH
                       ) == datetime.datetime(2200, 12, 1).date()
    assert floor_period(datetime.datetime(2000, 1, 1).date(), Period.MONTH
                       ) == datetime.datetime(2000, 1, 1).date()

    assert floor_period(datetime.datetime(2020, 5, 20).date(), Period.WEEK
                       ) == datetime.datetime(2020, 5, 18).date()
    assert floor_period(datetime.datetime(2200, 12, 31).date(), Period.WEEK
                       ) == datetime.datetime(2200, 12, 29).date()
    assert floor_period(datetime.datetime(2000, 1, 1).date(), Period.WEEK
                       ) == datetime.datetime(1999, 12, 27).date()

    assert floor_period(datetime.datetime(2020, 5, 20).date(), Period.DAY
                       ) == datetime.datetime(2020, 5, 20).date()
    assert floor_period(datetime.datetime(2200, 12, 31).date(), Period.DAY
                       ) == datetime.datetime(2200, 12, 31).date()
    assert floor_period(datetime.datetime(2000, 1, 1).date(), Period.DAY
                       ) == datetime.datetime(2000, 1, 1).date()


def test_next_period():
    assert next_period(datetime.datetime(2020, 5, 1).date(), Period.YEAR
                      ) == datetime.datetime(2021, 1, 1).date()
    assert next_period(datetime.datetime(2200, 12, 31).date(), Period.YEAR
                      ) == datetime.datetime(2201, 1, 1).date()
    assert next_period(datetime.datetime(2000, 1, 1).date(), Period.YEAR
                      ) == datetime.datetime(2001, 1, 1).date()

    assert next_period(datetime.datetime(2020, 5, 1).date(), Period.QUARTER
                      ) == datetime.datetime(2020, 7, 1).date()
    assert next_period(datetime.datetime(2200, 12, 31).date(), Period.QUARTER
                      ) == datetime.datetime(2201, 1, 1).date()
    assert next_period(datetime.datetime(2000, 1, 1).date(), Period.QUARTER
                      ) == datetime.datetime(2000, 4, 1).date()

    assert next_period(datetime.datetime(2020, 5, 1).date(), Period.MONTH
                      ) == datetime.datetime(2020, 6, 1).date()
    assert next_period(datetime.datetime(2200, 12, 31).date(), Period.MONTH
                      ) == datetime.datetime(2201, 1, 1).date()
    assert next_period(datetime.datetime(2000, 1, 1).date(), Period.MONTH
                      ) == datetime.datetime(2000, 2, 1).date()

    assert next_period(datetime.datetime(2020, 5, 1).date(), Period.WEEK
                      ) == datetime.datetime(2020, 5, 4).date()
    assert next_period(datetime.datetime(2200, 12, 31).date(), Period.WEEK
                      ) == datetime.datetime(2201, 1, 5).date()
    assert next_period(datetime.datetime(2000, 1, 1).date(), Period.WEEK
                      ) == datetime.datetime(2000, 1, 3).date()

    assert next_period(datetime.datetime(2020, 5, 1).date(), Period.DAY
                      ) == datetime.datetime(2020, 5, 2).date()
    assert next_period(datetime.datetime(2200, 12, 31).date(), Period.DAY
                      ) == datetime.datetime(2201, 1, 1).date()
    assert next_period(datetime.datetime(2000, 1, 1).date(), Period.DAY
                      ) == datetime.datetime(2000, 1, 2).date()


def test_period_thirds():
    assert period_thirds(datetime.datetime(2020, 5, 1).date(), Period.YEAR
                      ) == (datetime.datetime(2020, 5, 2).date(), datetime.datetime(2020, 9, 1).date())
    assert period_thirds(datetime.datetime(2020, 5, 1).date(), Period.QUARTER
                      ) == (datetime.datetime(2020, 5, 1).date(), datetime.datetime(2020, 5, 31).date())
    assert period_thirds(datetime.datetime(2020, 5, 1).date(), Period.MONTH
                      ) == (datetime.datetime(2020, 5, 11).date(), datetime.datetime(2020, 5, 21).date())
    assert period_thirds(datetime.datetime(2020, 5, 1).date(), Period.WEEK
                      ) == (datetime.datetime(2020, 4, 29).date(), datetime.datetime(2020, 5, 1).date())
    assert period_thirds(datetime.datetime(2020, 5, 1).date(), Period.DAY
                      ) == (datetime.datetime(2020, 5, 1, 8, 0), datetime.datetime(2020, 5, 1, 16, 0))

def test_period_halves():
    assert period_halves(datetime.datetime(2020, 5, 1).date(), Period.YEAR
                      ) == datetime.datetime(2020, 7, 2).date()
    assert period_halves(datetime.datetime(2020, 5, 1).date(), Period.QUARTER
                      ) == datetime.datetime(2020, 5, 16).date()
    assert period_halves(datetime.datetime(2020, 5, 1).date(), Period.MONTH
                      ) == datetime.datetime(2020, 5, 16).date()
    assert period_halves(datetime.datetime(2020, 5, 1).date(), Period.WEEK
                      ) == datetime.datetime(2020, 4, 30).date()
    assert period_halves(datetime.datetime(2020, 5, 1).date(), Period.DAY
                      ) == datetime.datetime(2020, 5, 1, 12, 0)


def test_override_thirds():
    assert override_thirds([datetime.datetime(2020, 5, 1).date(), datetime.datetime(2200, 12, 31).date()], Period.YEAR
            ) == ([datetime.datetime(2020, 5, 2).date(), datetime.datetime(2200, 5, 2).date()],
                  [datetime.datetime(2020, 9, 1).date(), datetime.datetime(2200, 9, 1).date()])
    assert override_thirds([datetime.datetime(2020, 5, 1).date(), datetime.datetime(2200, 12, 31).date()], Period.QUARTER
            ) == ([datetime.datetime(2020, 5, 1).date(), datetime.datetime(2200, 10, 31).date()],
                  [datetime.datetime(2020, 5, 31).date(), datetime.datetime(2200, 12, 1).date()])
    assert override_thirds([datetime.datetime(2020, 5, 1).date(), datetime.datetime(2200, 12, 31).date()], Period.MONTH
            ) == ([datetime.datetime(2020, 5, 11).date(), datetime.datetime(2200, 12, 11).date()],
                  [datetime.datetime(2020, 5, 21).date(), datetime.datetime(2200, 12, 21).date()])
    assert override_thirds([datetime.datetime(2020, 5, 1).date(), datetime.datetime(2200, 12, 31).date()], Period.WEEK
            ) == ([datetime.datetime(2020, 4, 29).date(), datetime.datetime(2200, 12, 31).date()],
                  [datetime.datetime(2020, 5, 1).date(), datetime.datetime(2201, 1, 2).date()])
    assert override_thirds([datetime.datetime(2020, 5, 1).date(), datetime.datetime(2200, 12, 31).date()], Period.DAY
            ) == ([datetime.datetime(2020, 5, 1, 8, 0), datetime.datetime(2200, 12, 31, 8, 0)],
                  [datetime.datetime(2020, 5, 1, 16, 0), datetime.datetime(2200, 12, 31, 16, 0)])

def test_override_halves():
    assert override_halves([datetime.datetime(2020, 5, 1).date(), datetime.datetime(2200, 12, 31).date()], Period.YEAR
            ) == [datetime.datetime(2020, 7, 2).date(), datetime.datetime(2200, 7, 2).date()]
    assert override_halves([datetime.datetime(2020, 5, 1).date(), datetime.datetime(2200, 12, 31).date()], Period.QUARTER
            ) == [datetime.datetime(2020, 5, 16).date(), datetime.datetime(2200, 11, 16).date()]
    assert override_halves([datetime.datetime(2020, 5, 1).date(), datetime.datetime(2200, 12, 31).date()], Period.MONTH
            ) == [datetime.datetime(2020, 5, 16).date(), datetime.datetime(2200, 12, 16).date()]
    assert override_halves([datetime.datetime(2020, 5, 1).date(), datetime.datetime(2200, 12, 31).date()], Period.WEEK
            ) == [datetime.datetime(2020, 4, 30).date(), datetime.datetime(2201, 1, 1).date()]
    assert override_halves([datetime.datetime(2020, 5, 1).date(), datetime.datetime(2200, 12, 31).date()], Period.DAY
            ) == [datetime.datetime(2020, 5, 1, 12, 0), datetime.datetime(2200, 12, 31, 12, 0)]


def test_categories_changes():
    year_periods, year_income_changes, year_expenses_changes = categories_changes(tr_balances, Period.YEAR)
    assert year_periods == [datetime.date(2020, 1, 1)]
    assert year_income_changes == {'Salary': [Decimal('2500')],
                              'Shopping': [Decimal('0')]}
    assert year_expenses_changes == {'Salary': [Decimal('0')],
                              'Shopping': [Decimal('50')]}

    quarter_periods, quarter_income_changes, quarter_expenses_changes = categories_changes(tr_balances, Period.QUARTER)
    assert quarter_periods == [datetime.date(2020, 4, 1), datetime.date(2020, 7, 1)]
    assert quarter_income_changes == {'Salary': [Decimal('2500'), Decimal('0')],
                              'Shopping': [Decimal('0'), Decimal('0')]}
    assert quarter_expenses_changes == {'Salary': [Decimal('0'), Decimal('0')],
                              'Shopping': [Decimal('0'), Decimal('50')]}

    month_periods, month_income_changes, month_expenses_changes = categories_changes(tr_balances, Period.MONTH)
    assert month_periods == [datetime.date(2020, 6, 1), datetime.date(2020, 7, 1)]
    assert month_income_changes == {'Salary': [Decimal('2500'), Decimal('0')],
                              'Shopping': [Decimal('0'), Decimal('0')]}
    assert month_expenses_changes == {'Salary': [Decimal('0'), Decimal('0')],
                              'Shopping': [Decimal('0'), Decimal('50')]}

    week_periods, week_income_changes, week_expenses_changes = categories_changes(tr_balances, Period.WEEK)
    assert week_periods == [datetime.date(2020, 6, 22), datetime.date(2020, 6, 29), datetime.date(2020, 7, 6)]
    assert week_income_changes == {'Salary': [Decimal('2500'), Decimal('0'), Decimal('0')],
                              'Shopping': [Decimal('0'), Decimal('0'), Decimal('0')]}
    assert week_expenses_changes == {'Salary': [Decimal('0'), Decimal('0'), Decimal('0')],
                              'Shopping': [Decimal('0'), Decimal('0'), Decimal('50')]}

    day_periods, day_income_changes, day_expenses_changes = categories_changes(tr_balances, Period.DAY)
    assert len(day_periods) == 15
    assert day_periods[0] == datetime.date(2020, 6, 28)
    assert day_periods[-1] == datetime.date(2020, 7, 12)
    assert day_income_changes['Salary'][0] == Decimal('2500')
    assert day_income_changes['Salary'][-1] == Decimal('0')
    assert day_expenses_changes['Shopping'][0] == Decimal('0')
    assert day_expenses_changes['Shopping'][-1] == Decimal('50')
