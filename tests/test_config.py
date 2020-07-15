from cashplot.config import Config

def test_config():
    with open("tests/test_config.json", "r") as fp:
        config = Config.loads(fp.read())
        assert config.savings_accounts == ['Emergency', 'Loan']
        assert config.net_ignore_accounts == ['Loan']
        assert config.match_rules[0] == ['Study', {'description': 'study'}]
