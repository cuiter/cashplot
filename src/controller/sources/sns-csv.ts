import * as Papa from "papaparse";
import { DECIMAL, SourceTransaction } from "../../model/entities";
import { Source } from "../../interfaces";
import { assert } from "../../utils";

/** Parser for SNS Bank's official CSV formats. Supports both the "CSV" and "CSV2004" variant. */
export class SNSBankCSVSource implements Source {
    public hasValidHeader(transactionData: string): boolean {
        const firstLine = transactionData.split("\n", 1)[0];

        const parsedCsv = Papa.parse(firstLine, {
            header: false,
        });

        if (parsedCsv.errors.length !== 0) {
            return false;
        } else {
            // The parsed CSV should contain the description column.
            return (parsedCsv.data[0] as Array<string>).length > 17;
        }
    }

    private transactionFromRow(
        row: Record<number, string>,
        line: number | null,
    ): SourceTransaction {
        const errorPrefix = `Invalid transaction data${
            line !== null ? ` on line ${line}` : ""
        }: `;

        function useColumn(
            description: string,
            columnIndex: number,
            isNumber = false,
            required = false,
        ): string | null {
            const value = row[columnIndex];

            if (required) {
                if (value === undefined || value === null || value === "") {
                    throw new Error(
                        `${errorPrefix}Could not determine ${description} (column ${
                            columnIndex + 1
                        } is empty)`,
                    );
                }

                if (isNumber && !Number.isFinite(Number(value))) {
                    throw new Error(
                        `${errorPrefix}Could not determine ${description} from value: "${value}"`,
                    );
                }
            }

            return value === "" ? null : value;
        }

        function useRequiredColumn(
            description: string,
            columnIndex: number,
            isNumber = false,
        ): string {
            return useColumn(description, columnIndex, isNumber, true) ?? "";
        }

        const rawDate = useRequiredColumn("date", 0);
        const account = useRequiredColumn("account", 1);
        const contraAccount = useColumn("contra-account", 2);
        const contraAccountName = useColumn("contra-account name", 3);
        const rawAmount = useRequiredColumn("amount", 10, true);
        const rawDescription = useRequiredColumn("description", 17);
        const date = new Date(
            rawDate.substr(6, 4) +
                "-" +
                rawDate.substr(3, 2) +
                "-" +
                rawDate.substr(0, 2),
        );
        assert(
            date instanceof Date && !isNaN(date.valueOf()),
            `${errorPrefix}Could not determine date from value: "${rawDate}"`,
        );
        const amount = Number(rawAmount) * DECIMAL;
        const description =
            rawDescription[0] == "'"
                ? rawDescription.substr(1, rawDescription.length - 2) // Remove surrounding quotes
                : rawDescription;

        return new SourceTransaction(
            date,
            amount,
            account,
            contraAccount,
            contraAccountName,
            description,
        );
    }

    public parseTransactions(transactionData: string): SourceTransaction[] {
        const parsedCsv = Papa.parse(transactionData, {
            header: false,
            skipEmptyLines: true,
        });

        if (parsedCsv.errors.length !== 0) {
            const errorsJoined = parsedCsv.errors
                .map((error) => JSON.stringify(error))
                .join("\n");
            throw new Error(
                "Errors while parsing transaction data:\n" + errorsJoined,
            );
        }

        const rows = parsedCsv.data as Record<number, string>[];

        const transactions = rows.map((row, index) =>
            this.transactionFromRow(row, index + 1),
        );

        return transactions;
    }
}
