import re
from typing import NamedTuple
import datetime
from decimal import Decimal
from cashplot.util import *
from cashplot.consts import *

class TransactionBase(EqHash, Repr):
    """A transaction without a category assigned."""

    def __init__(self, date, counter_name, counter_account, description, change):
        assert type(date) is datetime.date
        assert type(counter_name) is str
        assert type(counter_account) is str
        assert type(description) is str
        assert type(change) is Decimal

        self.date = date
        self.counter_name = counter_name
        self.counter_account = counter_account
        self.description = description
        self.change = change


class Transaction(TransactionBase):
    """A transaction with a category assigned."""

    def __init__(self, category, date, counter_name, counter_account, description, change):
        super().__init__(date, counter_name, counter_account, description, change)
        assert type(category) is str
        self.category = category


class TransactionBalance(Transaction):
    """A transaction combined with changes and balances for each account."""

    def __init__(self, category, date, counter_name, counter_account, description, change, changes, balances):
        super().__init__(category, date, counter_name, counter_account, description, change)
        assert type(changes) is dict
        for account_name in changes.keys():
            assert type(changes[account_name]) is Decimal
        assert type(balances) is dict
        for account_name in balances.keys():
            assert type(balances[account_name]) is Decimal
        self.changes = changes
        self.balances = balances


def categorize(transactions, config):
    """Categorize transactions based on matching rules in the configuration."""
    def categorize_transaction(transaction):
        for match_rule in config.match_rules:
            category = match_rule[0]
            match = match_rule[1]
            if not ('counter_name' in match and re.search(match['counter_name'], transaction.counter_name) is None
                    or 'counter_account' in match and re.search(match['counter_account'], transaction.counter_account) is None
                    or 'description' in match and re.search(match['description'], transaction.description) is None):
                return Transaction(category, transaction.date, transaction.counter_name, transaction.counter_account, transaction.description, transaction.change)
        raise LookupError(
            "No rule matching transaction with date " + str(transaction.date))
    return list(map(categorize_transaction, transactions))


def transaction_balances(transactions, config):
    """Calculate the change and balance for every account on each transaction."""
    def zero_accounts():
        accounts = {MAIN_ACCOUNT_NAME: Decimal(0)}
        for account_name in config.savings_accounts:
            accounts[account_name] = Decimal(0)
        return accounts

    def calculate_net_change(changes):
        net_change = Decimal(0)
        for account_name in changes.keys():
            if account_name not in config.net_ignore_accounts:
                net_change += changes[account_name]
        return net_change

    old_balances = config.starting_balances
    tr_balances = []

    for transaction in transactions:
        changes = zero_accounts()

        changes[MAIN_ACCOUNT_NAME] = transaction.change
        if transaction.category in config.savings_accounts:
            changes[transaction.category] = -transaction.change

        balances = zero_accounts()
        for account_name in old_balances.keys():
            balances[account_name] = old_balances[account_name] + \
                changes[account_name]

        transaction_changes = {
            **changes, **{NET_ACCOUNT_NAME: calculate_net_change(changes)}}
        transaction_balances = {
            **balances, **{NET_ACCOUNT_NAME: calculate_net_change(balances)}}
        tr_balances.append(TransactionBalance(transaction.category, transaction.date, transaction.counter_name,
                                              transaction.counter_account, transaction.description, transaction.change, transaction_changes, transaction_balances))

        old_balances = balances
    return tr_balances
