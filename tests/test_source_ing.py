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
    assert transaction.direction == True
    assert transaction.amount == Decimal('2000')
    assert transaction.tr_type == 'Transfer'
    assert transaction.description == 'Salary for June 2020'


def test_load_ing_transactions():
    # English transactions file
    with open("tests/data/test_transactions.csv", "r") as tfp:
        transactions_uncategorized = load_ing_transactions(tfp)
        assert transactions_uncategorized == [
            INGTransaction(datetime.date(2020, 6, 28), "Company Inc.", "NL00MAIN1234567890",
                           "NL01WORK0987654321", "OV", True, Decimal('2000'), 'Transfer', 'Salary for June 2020'),
            INGTransaction(datetime.date(2020, 6, 28), 'Company Inc.', 'NL00MAIN1234567890',
                           'NL01WORK0987654321', 'OV', True, Decimal('500'), 'Transfer', 'Bonus for June 2020'),
            INGTransaction(datetime.date(2020, 6, 29), 'Mr. G', 'NL00MAIN1234567890', 'NL00MAIN1234567890',
                           'GT', False, Decimal('100'), 'Online Banking', 'To Orange Savings Account ABC123456'),
            INGTransaction(datetime.date(2020, 7, 1), 'Mr. G', 'NL00MAIN1234567890', 'NL00MAIN1234567890',
                           'GT', False, Decimal('200'), 'Online Banking', 'To Orange Savings Account DEF999999'),
            INGTransaction(datetime.date(2020, 7, 12), 'bol.com b.v.', 'NL27INGB0000026500', 'NL00MAIN1234567890',
                           'ID', False, Decimal('50'), 'iDEAL', 'Name: bol.com b.v. Description: 90340932902 2492049402')
        ]
    # Dutch transactions file
    with open("tests/data/test_transactions_nl.csv", "r") as tfp:
        transactions_uncategorized = load_ing_transactions(tfp)
        assert transactions_uncategorized == [
            INGTransaction(datetime.date(2020, 6, 28), "Company Inc.", "NL00MAIN1234567890",
                           "NL01WORK0987654321", "OV", True, Decimal('2000'), 'Overschrijving', 'Salaris for juni 2020'),
            INGTransaction(datetime.date(2020, 6, 28), 'Company Inc.', 'NL00MAIN1234567890',
                           'NL01WORK0987654321', 'OV', True, Decimal('500'), 'Overschrijving', 'Bonus voor juni 2020'),
            INGTransaction(datetime.date(2020, 6, 29), 'Mr. G', 'NL00MAIN1234567890', 'NL00MAIN1234567890',
                           'GT', False, Decimal('100'), 'Online bankieren', 'Naar Oranje spaarrekening ABC123456'),
            INGTransaction(datetime.date(2020, 7, 1), 'Mr. G', 'NL00MAIN1234567890', 'NL00MAIN1234567890',
                           'GT', False, Decimal('200'), 'Online bankieren', 'Naar Oranje spaarrekening DEF999999'),
            INGTransaction(datetime.date(2020, 7, 12), 'bol.com b.v.', 'NL27INGB0000026500', 'NL00MAIN1234567890',
                           'ID', False, Decimal('50'), 'iDEAL', 'Naam: bol.com b.v. Beschrijving: 90340932902 2492049402')
        ]


def test_convert():
    transaction = INGTransaction.load_row(row)
    assert transaction.convert() == TransactionBase(datetime.date(2020, 6, 28),
                                                    "Company Inc.", "NL01WORK0987654321", "Salary for June 2020", Decimal('2000'))
