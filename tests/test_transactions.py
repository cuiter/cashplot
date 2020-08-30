from cashplot.transactions import *
from cashplot.config import Config
from cashplot.sources.ing import load_ing_transactions
from decimal import Decimal
import datetime

with open("tests/data/test_config.json", "r") as cfp:
    config = Config.loads(cfp.read())
with open("tests/data/test_transactions.csv", "r") as tfp:
    transactions_uncategorized = list(
        map(lambda tr: tr.convert(), load_ing_transactions(tfp)))


def test_categorize():
    transactions = categorize(transactions_uncategorized, config)
    assert transactions == [
        Transaction('Salary', datetime.date(2020, 6, 28), 'Company Inc.',
                    'NL01WORK0987654321', 'Salary for June 2020', Decimal('2000')),
        Transaction('Salary', datetime.date(2020, 6, 28), 'Company Inc.',
                    'NL01WORK0987654321', 'Bonus for June 2020', Decimal('500')),
        Transaction('Emergency', datetime.date(2020, 6, 29), 'Mr. G',
                    'NL00MAIN1234567890', 'To Orange Savings Account ABC123456', Decimal('-100')),
        Transaction('Loan', datetime.date(2020, 7, 1), 'Mr. G', 'NL00MAIN1234567890',
                    'To Orange Savings Account DEF999999', Decimal('-200'))
    ]


def test_transaction_balances():
    tr_balances = transaction_balances(categorize(
        transactions_uncategorized, config), config)
    assert tr_balances == [
        TransactionBalance('Salary', datetime.date(2020, 6, 28), 'Company Inc.', 'NL01WORK0987654321', 'Salary for June 2020', Decimal('2000'), {'main': Decimal('2000'), 'Emergency': Decimal(
            '0'), 'Loan': Decimal('0'), 'net': Decimal('2000')}, {'main': Decimal('2000'), 'Emergency': Decimal('0'), 'Loan': Decimal('0'), 'net': Decimal('2000')}),
        TransactionBalance('Salary', datetime.date(2020, 6, 28), 'Company Inc.', 'NL01WORK0987654321', 'Bonus for June 2020', Decimal('500'), {'main': Decimal('500'), 'Emergency': Decimal(
            '0'), 'Loan': Decimal('0'), 'net': Decimal('500')}, {'main': Decimal('2500'), 'Emergency': Decimal('0'), 'Loan': Decimal('0'), 'net': Decimal('2500')}),
        TransactionBalance('Emergency', datetime.date(2020, 6, 29), 'Mr. G', 'NL00MAIN1234567890', 'To Orange Savings Account ABC123456', Decimal('-100'), {'main': Decimal(
            '-100'), 'Emergency': Decimal('100'), 'Loan': Decimal('0'), 'net': Decimal('0')}, {'main': Decimal('2400'), 'Emergency': Decimal('100'), 'Loan': Decimal('0'), 'net': Decimal('2500')}),
        TransactionBalance('Loan', datetime.date(2020, 7, 1), 'Mr. G', 'NL00MAIN1234567890', 'To Orange Savings Account DEF999999', Decimal('-200'), {'main': Decimal('-200'), 'Emergency': Decimal(
            '0'), 'Loan': Decimal('200'), 'net': Decimal('-200')}, {'main': Decimal('2200'), 'Emergency': Decimal('100'), 'Loan': Decimal('200'), 'net': Decimal('2300')})
    ]
