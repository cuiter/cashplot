import json


class Config:
    def __init__(self, savings_accounts, net_ignore_accounts, match_rules):
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

        self.savings_accounts = savings_accounts
        self.net_ignore_accounts = net_ignore_accounts
        self.match_rules = match_rules

    def loads(jsonstr):
        table = json.loads(jsonstr)
        return Config(table['savings_accounts'], table['net_ignore_accounts'], table['match_rules'])


def test_ha():
    assert True
