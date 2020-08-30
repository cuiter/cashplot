import json

from numbers import Number
from decimal import Decimal
from cashplot.consts import MAIN_ACCOUNT_NAME

class Config:
    def __init__(self, savings_accounts, net_ignore_accounts, starting_balances, match_rules):
        assert type(savings_accounts) is list
        for name in savings_accounts:
            assert type(name) is str
        assert type(net_ignore_accounts) is list
        for name in net_ignore_accounts:
            assert type(name) is str
        assert type(match_rules) is list
        for match_rule in match_rules:
            assert type(match_rule) is list
            assert len(match_rule) == 2
            assert type(match_rule[0]) is str
            match = match_rule[1]
            assert type(match) is dict
            for field in match:
                assert field in ['counter_account',
                                 'counter_name', 'description']
        for account_name in starting_balances:
            assert account_name == MAIN_ACCOUNT_NAME or account_name in savings_accounts
            assert isinstance(starting_balances[account_name], Number)

        # Convert starting balances to Decimal and add missing starting balances.
        for account_name in [MAIN_ACCOUNT_NAME] + savings_accounts:
            if account_name in starting_balances.keys():
                starting_balances[account_name] = Decimal(starting_balances[account_name])
            else:
                starting_balances[account_name] = Decimal(0)

        # Add default rule to catch transactions that aren't categorized.
        match_rules.append(["Uncategorized", { }])

        self.savings_accounts = savings_accounts
        self.net_ignore_accounts = net_ignore_accounts
        self.starting_balances = starting_balances
        self.match_rules = match_rules


    def loads(jsonstr):
        """Parse the config from the JSON string."""
        table = json.loads(jsonstr)
        return Config(table['savings_accounts'], table['net_ignore_accounts'], table["starting_balances"], table['match_rules'])
