from cashplot.config import Config
from cashplot.sources.ing import load_ing_transactions
from cashplot.transactions import *


def main(transactionspath, configpath):
    with open(transactionspath, 'r') as tfp, open(configpath, 'r') as cfp:
        ing_transactions = load_ing_transactions(tfp)
        config = Config.loads(cfp.read())
        transactions = categorize(
            list(map(lambda tr: tr.convert(), ing_transactions)), config)
        transactions_bal = transaction_balances(transactions, config)
        for tr in transactions_bal:
            print("Balance " + str(tr.balances['main']))
