from cashplot.transactions import *
from cashplot.config import Config
from decimal import Decimal
import datetime

with open("tests/test_config.json", "r") as fp:
    config = Config.loads(fp.read())

def test_categorize():
    transactions = [TransactionBase(datetime.datetime.now().date(), 'DUO', 'NL00DUO', 'study finance', Decimal(100))]
    assert categorize(transactions, config) == [Transaction('Study', datetime.datetime.now().date(), 'DUO', 'NL00DUO', 'study finance', Decimal(100))]

def test_transaction_balances():
    transactions = [Transaction('Salary', datetime.datetime.now().date(), 'Work', 'NL01WORK', 'salary', Decimal(2000)),
                    Transaction('Emergency', datetime.datetime.now().date(), 'Self', 'NL00SELF', 'to emergency fund', Decimal(-100)),
                    Transaction('Loan', datetime.datetime.now().date(), 'Self', 'NL00SELF', 'to loan fund', Decimal(-200))]
    assert transaction_balances(transactions, config) == [
        TransactionBalance('Salary', datetime.datetime.now().date(), 'Work', 'NL01WORK', 'salary', Decimal(2000), {'main': Decimal(2000), 'Emergency': Decimal(0), 'Loan': Decimal(0), 'net': Decimal(2000)}, {'main': Decimal(2000), 'Emergency': Decimal(0), 'Loan': Decimal(0), 'net': Decimal(2000)}),
        TransactionBalance('Emergency', datetime.datetime.now().date(), 'Self', 'NL00SELF', 'to emergency fund', Decimal(-100), {'main': Decimal(-100), 'Emergency': Decimal(100), 'Loan': Decimal(0), 'net': Decimal(0)}, {'main': Decimal(1900), 'Emergency': Decimal(100), 'Loan': Decimal(0), 'net': Decimal(2000)}),
        TransactionBalance('Loan', datetime.datetime.now().date(), 'Self', 'NL00SELF', 'to loan fund', Decimal(-200), {'main': Decimal(-200), 'Emergency': Decimal(0), 'Loan': Decimal(200), 'net': Decimal(-200)}, {'main': Decimal(1700), 'Emergency': Decimal(100), 'Loan': Decimal(200), 'net': Decimal(1800)}),
    ]
