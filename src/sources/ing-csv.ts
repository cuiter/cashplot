import { Source, SourceTransaction, DECIMAL } from "../types";
import * as Papa from "papaparse";

/** Parser for ING Bank's official CSV format. Supports both the English and Dutch variant. */
export class INGBankCSVSource implements Source {
    // For more info on the format itself, see
    // https://www.ing.nl/media/ING_CSV_Mijn_ING_Augustus2020_tcm162-201483.pdf

    public isValidData(transactionData: string): boolean {
        return false;
    }

    private transactionFromRow(row: any): SourceTransaction {
        const rawDate = row["Date"] || row["Datum"];

        const contraAccountName =
            row["Name / Description"] || row["Naam / Omschrijving"];
        const account = row["Account"] || row["Rekening"];
        const contraAccount = row["Counterparty"] || row["Tegenrekening"];
        const rawDirection = row["Debit/credit"] || row["Af Bij"];
        const rawAmount = row["Amount (EUR)"] || row["Bedrag (EUR)"];
        const description = row["Notifications"] || row["Mededelingen"];

        const date = new Date(
            rawDate.substr(0, 4) +
                "-" +
                rawDate.substr(4, 2) +
                "-" +
                rawDate.substr(6, 2),
        );
        const direction =
            rawDirection === "Credit" || rawDirection === "Bij"
                ? true
                : rawDirection === "Debit" || rawDirection === "Af"
                ? false
                : null;
        if (direction === null) {
            new Error(
                "Could not determine transaction direction based on value: " +
                    rawDirection,
            );
        }
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

        const transactions = rows.map((row) => this.transactionFromRow(row));

        return transactions;
    }
}
