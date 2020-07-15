from cashplot.sources.ing import *
from cashplot.transactions import TransactionBase
from decimal import Decimal
import datetime

row = ['20191215','GOOD STORE','NL00SELF','NL05GOOD','BA','Debit','50,00','Payment terminal','Purchase no. 32']

def test_load_row():
    transaction = INGTransaction.load_row(row)
    assert transaction.date == datetime.datetime(2019, 12, 15).date()
    assert transaction.counter_name == 'GOOD STORE'
    assert transaction.account == 'NL00SELF'
    assert transaction.counter_account == 'NL05GOOD'
    assert transaction.code == 'BA'
    assert transaction.direction == 'Debit'
    assert transaction.amount == Decimal(50)
    assert transaction.tr_type == 'Payment terminal'
    assert transaction.description == 'Purchase no. 32'

def test_convert():
    transaction = INGTransaction.load_row(row)
    assert transaction.convert() == TransactionBase(datetime.datetime(2019, 12, 15).date(), "GOOD STORE", "NL05GOOD", "Purchase no. 32", Decimal(-50))
