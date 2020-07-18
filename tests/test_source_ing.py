from cashplot.sources.ing import *
from cashplot.transactions import TransactionBase
from decimal import Decimal
import datetime

row = ['20200628', 'Company Inc.', 'NL00MAIN1234567890', 'NL01WORK0987654321',
       'OV', 'Credit', '2000', 'Transfer', 'Salary for June 2020']


def test_load_row():
    transaction = INGTransaction.load_row(row)
    assert transaction.date == datetime.datetime(2020, 6, 28).date()
    assert transaction.counter_name == 'Company Inc.'
    assert transaction.account == 'NL00MAIN1234567890'
    assert transaction.counter_account == 'NL01WORK0987654321'
    assert transaction.code == 'OV'
    assert transaction.direction == 'Credit'
    assert transaction.amount == Decimal('2000')
    assert transaction.tr_type == 'Transfer'
    assert transaction.description == 'Salary for June 2020'


def test_load_ing_transactions():
    with open("tests/test_transactions.csv", "r") as tfp:
        transactions_uncategorized = load_ing_transactions(tfp)
        assert transactions_uncategorized == [
            INGTransaction(datetime.date(2020, 6, 28), "Company Inc.", "NL00MAIN1234567890",
                           "NL01WORK0987654321", "OV", "Credit", Decimal('2000'), 'Transfer', 'Salary for June 2020'),
            INGTransaction(datetime.date(2020, 6, 28), 'Company Inc.', 'NL00MAIN1234567890',
                           'NL01WORK0987654321', 'OV', 'Credit', Decimal('500'), 'Transfer', 'Bonus for June 2020'),
            INGTransaction(datetime.date(2020, 6, 29), 'Mr. G', 'NL00MAIN1234567890', 'NL00MAIN1234567890',
                           'GT', 'Debit', Decimal('100'), 'Online Banking', 'To Orange Savings Account ABC123456'),
            INGTransaction(datetime.date(2020, 7, 1), 'Mr. G', 'NL00MAIN1234567890', 'NL00MAIN1234567890',
                           'GT', 'Debit', Decimal('200'), 'Online Banking', 'To Orange Savings Account DEF999999')
        ]


def test_convert():
    transaction = INGTransaction.load_row(row)
    assert transaction.convert() == TransactionBase(datetime.date(2020, 6, 28),
                                                    "Company Inc.", "NL01WORK0987654321", "Salary for June 2020", Decimal('2000'))
