# cashplot

Draws a graph of your bank balance and income/expenses over time.

Currently only supports ING bank transaction files.

## Features

- Generates a time/money graph of:
  - The balance of the main and savings accounts.
  - Net worth (sum of main + savings accounts).
  - Monthly income/expenses grouped by category.
- Uses Plotly to create the graph as a HTML file for offline viewing.

## How to use

Create a Virtualenv directory in `venv/`:
`virtualenv venv && source venv/bin/activate`

Install the dependencies:
`pip install -r requirements.txt`

Run cashplot:
`python -m cashplot <path/to/transactions.csv> <path/to/config.json>`

## Configuration

The configuration file (`config.json`) has the following attributes:

`savings_accounts` Array of names of savings accounts  
`net_ignore_accounts` Array of names of savings accounts that don't count towards
                    the "net worth" account  
`match_rules` Array of category matching rules  
Each category matching rule is an array of two elements, the category name and
the rules table. This table can have the following attributes:
"countername", "counterbalance", and "description". The values of these
attributes are PCRE regexes. Transactions are matched against all of the given
attributes.

An example configuration would be:
```
{
    "accountnames": [
        "Savings Main",
        "Savings Student Loan"
    ],
    "netignoreaccounts": [
        "Savings Student Loan"
    ],
    "categorymatchrules": [
        ["Savings Main", {
            "countername": "Orange Savings Account ABC123456"
        }],
        ["Savings Student Loan", {
            "countername": "Orange Savings Account DEF789123"
        }],
        ["Salary", {
            "counteraccount": "NL55INGB5555555555",
            "description": "(?i)Salary for month"
        }],
        ["Health Insurance", {
            "countername": "ABCDEF Health Insurance",
            "description": "Automatic withdrawal for period"
        }],
        ["Other" { }]
    ]
}
```

## Getting transaction files

Transaction files can be downloaded from the ING bank online portal. When
logged in, click on the download icon near the balance of the checking
account. It's recommended to select the earliest possible start date, so that
the calculated end balance corresponds to the current balance. Select
"Comma-separated CSV (English)" and click on "Download".

## Limitations

Take the graph data with a grain of salt; always carefully check before taking
conclusions.

Only one main (checking) account is supported. The balance of the
savings accounts is calculated by the transactions between the main and savings
accounts. If the savings accounts are modified by other sources (for example
interest), this won't get taken into account.

Transactions made on the same day can get reordered, which might result in a
negative balance on the graph which didn't happen in actuality.

## Feedback/improvements

Any constructive criticism or ideas are appreciated.  
If there is a feature that you'd like to add (such as support for another
bank), please submit a PR with an example transaction file.
