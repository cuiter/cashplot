from cashplot.main import *
import argparse


parser = argparse.ArgumentParser(
    description='Graphs a bank balance and income/expenses over time.')
parser.add_argument('transactions_file', help='path to transactions export file')
parser.add_argument('--config', metavar='config_file', default='./config.json',
                    help='path to configuration file (default: ./config.json)')
parser.add_argument('--period', default='month',
                    help='period used for totals (default: month)', choices=period_choices())

args = parser.parse_args()

main(args.transactions_file, args.config, args.period)
