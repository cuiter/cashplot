from cashplot.graph import *
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


def test_floor_month():
    assert floor_month(datetime.datetime(2020, 5, 20).date()
                       ) == datetime.datetime(2020, 5, 1).date()
    assert floor_month(datetime.datetime(2200, 12, 31).date()
                       ) == datetime.datetime(2200, 12, 1).date()
    assert floor_month(datetime.datetime(2000, 1, 1).date()
                       ) == datetime.datetime(2000, 1, 1).date()


def test_next_month():
    assert next_month(datetime.datetime(2020, 5, 1).date()
                      ) == datetime.datetime(2020, 6, 1).date()
    assert next_month(datetime.datetime(2200, 12, 31).date()
                      ) == datetime.datetime(2201, 1, 1).date()
    assert next_month(datetime.datetime(2000, 1, 1).date()
                      ) == datetime.datetime(2000, 2, 1).date()


def test_override_days():
    assert override_days([datetime.datetime(2020, 5, 20).date(),
                          datetime.datetime(2200, 12, 31).date(),
                          datetime.datetime(2000, 1, 1).date()],
                         15) == [
        datetime.datetime(2020, 5, 15).date(),
        datetime.datetime(2200, 12, 15).date(),
        datetime.datetime(2000, 1, 15).date()
    ]


def test_get_categories():
    assert get_categories(tr_balances) == ['Salary', 'Shopping']


def test_categories_changes():
    months, income_changes, expenses_changes = categories_changes(tr_balances)
    assert months == [datetime.date(2020, 6, 1), datetime.date(2020, 7, 1)]
    assert income_changes == {'Salary': [Decimal('2500'), Decimal('0')],
                              'Shopping': [Decimal('0'), Decimal('0')]}
    assert expenses_changes == {'Salary': [Decimal('0'), Decimal('0')],
                              'Shopping': [Decimal('0'), Decimal('50')]}


def test_last_year_range():
    ly_range = last_year_range(tr_balances)
    assert ly_range == [datetime.date(2019, 7, 12), datetime.date(2020, 7, 12)]
