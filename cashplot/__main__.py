from cashplot.main import main
import sys

if len(sys.argv) != 3:
    print(sys.argv[0] + " <path/to/transactions.csv> <path/to/config.json>")
    sys.exit(1)

main(sys.argv[1], sys.argv[2])
