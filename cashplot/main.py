from cashplot.config import Config
from cashplot.sources.ing import load_ing_transactions
from cashplot.graph import create_graph
from cashplot.transactions import *


def main(transactionspath, configpath):
    with open(transactionspath, 'r') as tfp, open(configpath, 'r') as cfp:
        ing_transactions = load_ing_transactions(tfp)
        config = Config.loads(cfp.read())
        transactions = categorize(
            list(map(lambda tr: tr.convert(), ing_transactions)), config)
        transactions_bal = transaction_balances(transactions, config)
        fig = create_graph(transactions_bal)
        fig.show()
