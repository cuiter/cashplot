from cashplot.config import Config


def test_config():
    with open("tests/data/test_config.json", "r") as fp:
        config = Config.loads(fp.read())
        assert config.savings_accounts == ['Emergency', 'Loan']
        assert config.net_ignore_accounts == ['Loan']
        assert config.match_rules[0] == ['Salary', {
            'counter_name': 'Company Inc.', 'counter_account': 'NL01WORK0987654321'}]
