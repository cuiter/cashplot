# cashplot

Draws a graph of bank balance and income/expenses over time.

Supports ING Bank transaction files (CSV format).

## Features

- Generates a time/money graph of:
  - Balance of the main and savings accounts.
  - Net worth (sum of main + savings accounts).
  - Monthly income/expenses grouped by category.
- Uses Plotly to generate the graph.  
  This means easy zooming / scrolling / filtering by category.

## How to use

Create a Virtualenv directory in `venv/`:  
`virtualenv venv && source venv/bin/activate`

Install the dependencies:  
`pip install -r requirements.txt`

Run cashplot:  
`python -m cashplot <path/to/transactions.csv> <path/to/config.json>`

When you run cashplot, the graph is displayed in a browser window.  
By default, the graph is zoomed in on the last year. You can double-click to
zoom out and see all the years for which data is available.

## Configuration

Transactions are grouped into categories based on matching rules.
These matching rules can be set in the configuration file (`config.json`):

`savings_accounts` Array of names of savings accounts  
`net_ignore_accounts` Array of names of savings accounts that don't count
towards the "net worth" account  
`starting_balances` The starting balance of the accounts before the
transactions have occurred. Unnoted accounts are assumed to have a starting
balance of zero.  
`match_rules` Array of matching rules  
Each matching rule is an array of two elements, the category name and
the rules table. This table can have the following attributes:
`counter_name`, `counter_account`, and `description`. The values of these
attributes are Python regexes. For example, `(?i)` can be used to match with
case-insensitivity. Transactions are matched against all of the
given attributes.
It's possible to specify multiple matching rules per category.

Transactions with a category that corresponds to the name of a savings account
are treated as a transaction between the main and savings account.

An example configuration would be:
```
{
    "savings_accounts": [
        "Savings Main",
        "Savings Student Loan"
    ],
    "net_ignore_accounts": [
        "Savings Student Loan"
    ],
    "starting_balances": {
        "Savings Main": 0.53
    },
    "match_rules": [
        ["Savings Main", {
            "counter_name": "Orange Savings Account ABC123456"
        }],
        ["Savings Student Loan", {
            "counter_name": "Orange Savings Account DEF789123"
        }],
        ["Salary", {
            "counter_account": "NL55INGB5555555555",
            "description": "(?i)Salary for month"
        }],
        ["Health Insurance", {
            "counter_name": "ABCDEF Health Insurance",
            "description": "Automatic withdrawal for period"
        }],
        ["Health Insurance", {
            "counter_name": "DEFCHI Other Health Insurance",
            "description": "Automatic withdrawal for period"
        }],
        ["Other" { }]
    ]
}
```

## Getting transaction files

Transaction files can be downloaded from the ING Bank online portal. When
logged in, click on the download icon near the balance of the checking
account. It's recommended to select the earliest possible start date, so that
the calculated end balance corresponds to the current balance. Select
"Comma-separated CSV (English)" and click on "Download".

## Limitations

Take the graph data with a grain of salt; always carefully check before taking
conclusions.

There is no way to specify a starting balance for the main and savings
accounts. If this is missing from the transactions, initial transactions need
to be added manually.

Only one main (checking) account is supported. The balance of the
savings accounts is calculated by the transactions between the main and savings
accounts. If the savings accounts are modified by other sources (for example
interest), this won't get taken into account.

Transactions made on the same day can get reordered, which might result in a
negative balance on the graph when it did not happen in actuality.

## Development

This program is tested with PyTest and auto-formatted with AutoPEP8 (see
`dev-requirements.txt`).

## Feedback/improvements

Contributions and constructive criticism or ideas are appreciated.  
If you'd like another bank to be supported, please submit a PR with an example
transaction file to develop against.
