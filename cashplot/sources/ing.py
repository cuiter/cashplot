import datetime
import csv
from decimal import Decimal
from cashplot.transactions import TransactionBase
from cashplot.util import *


class INGTransaction(EqHash, Repr):
    def __init__(self, date, counter_name, account, counter_account, code, direction, amount, tr_type, description):
        self.date = date
        self.counter_name = counter_name
        self.account = account
        self.counter_account = counter_account
        self.code = code
        self.direction = direction
        self.amount = amount
        self.tr_type = tr_type
        self.description = description

    def load_row(row):
        date = datetime.datetime.strptime(row[0], "%Y%m%d").date()
        counter_name = row[1]
        account = row[2]
        counter_account = row[3]
        code = row[4]
        direction = row[5]
        amount = Decimal(row[6].replace(',', '.'))
        tr_type = row[7]
        description = row[8]

        return INGTransaction(date, counter_name, account, counter_account, code, direction, amount, tr_type, description)

    def convert(self):
        return TransactionBase(self.date, self.counter_name, self.counter_account, self.description, self.amount if self.direction == 'Credit' else -self.amount)


def load_ing_transactions(fp):
    csv_reader = csv.reader(fp, delimiter=',')
    line_count = 0
    results = []
    for row in csv_reader:
        if line_count > 0:
            results.append(INGTransaction.load_row(row))
        line_count += 1
    results.reverse()
    return results
