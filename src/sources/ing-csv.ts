import { Source, SourceTransaction, DECIMAL } from "../types";
import { assert } from "../utils";
import * as Papa from "papaparse";

const nlHeaders = [
    "Datum",
    "Naam / Omschrijving",
    "Rekening",
    "Tegenrekening",
    "Af Bij",
    "Bedrag (EUR)",
    "Mededelingen",
];
const enHeaders = [
    "Date",
    "Name / Description",
    "Account",
    "Counterparty",
    "Debit/credit",
    "Amount (EUR)",
    "Notifications",
];

/** Parser for ING Bank's official CSV format. Supports both the English and Dutch variant. */
export class INGBankCSVSource implements Source {
    // For more info on the format itself, see
    // https://www.ing.nl/media/ING_CSV_Mijn_ING_Augustus2020_tcm162-201483.pdf

    public hasValidHeader(transactionData: string): boolean {
        var firstLine = transactionData.split("\n", 1)[0];

        const parsedCsv = Papa.parse(firstLine, {
            header: true,
        });

        if (parsedCsv.errors.length !== 0) {
            return false;
        } else {
            const csvHeaders = parsedCsv.meta.fields ?? [];

            return (
                !nlHeaders.some(
                    (header) => csvHeaders.indexOf(header) === -1,
                ) ||
                !enHeaders.some((header) => csvHeaders.indexOf(header) === -1)
            );
        }
    }

    private transactionFromRow(
        row: any,
        line: number | null,
    ): SourceTransaction {
        const errorPrefix = `Invalid transaction data${
            line !== null ? ` on line ${line}` : ""
        }: `;

        function useColumn(description: string, columnNames: string[]): string {
            const values = columnNames
                .map((name) => row[name])
                .filter(
                    (value) => typeof value === "string" && value.length > 0,
                );

            if (values.length > 0) {
                return values[0];
            } else {
                throw new Error(
                    `${errorPrefix}Could not determine ${description} (empty column)`,
                );
            }
        }

        const rawDate = useColumn("date", ["Date", "Datum"]);
        const contraAccountName = useColumn("contra-account", [
            "Name / Description",
            "Naam / Omschrijving",
        ]);
        const account = useColumn("account", ["Account", "Rekening"]);
        const contraAccount = useColumn("contra-account", [
            "Counterparty",
            "Tegenrekening",
        ]);
        const rawDirection = useColumn("direction", ["Debit/credit", "Af Bij"]);
        const rawAmount = useColumn("amount", ["Amount (EUR)", "Bedrag (EUR)"]);
        const description = useColumn("description", [
            "Notifications",
            "Mededelingen",
        ]);

        const date = new Date(
            rawDate.substr(0, 4) +
                "-" +
                rawDate.substr(4, 2) +
                "-" +
                rawDate.substr(6, 2),
        );
        assert(
            date instanceof Date && !isNaN(date.valueOf()),
            `${errorPrefix}Could not determine date from value: "${rawDate}"`,
        );
        const direction =
            rawDirection === "Credit" || rawDirection === "Bij"
                ? true
                : rawDirection === "Debit" || rawDirection === "Af"
                ? false
                : null;
        assert(
            direction !== null,
            `${errorPrefix}Could not determine direction from value: "${rawDirection}"`,
        );
        const amount =
            Number(rawAmount.replace(",", ".")) *
            (direction ? DECIMAL : -DECIMAL);

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
            header: true,
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

        const rows = parsedCsv.data as any[];

        const transactions = rows.map((row, index) =>
            this.transactionFromRow(row, index + 2),
        );

        return transactions;
    }
}
