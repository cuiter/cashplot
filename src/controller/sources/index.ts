import { SourceTransaction } from "../../model/entities";
import { INGBankCSVSource } from "./ing-csv";
import { SNSBankCSVSource } from "./sns-csv";

export interface Sources {
    /**
     * Loads the source transactions from the given data.
     * Detects the format and selects the right parser accordingly.
     * Throws an error if the provided transactions data could not be parsed.
     * Throws an error if there were no transactions in the provided data.
     * Note: Sorts the resulting transactions by date ascending.
     */
    parseTransactions(transactionData: string): Array<SourceTransaction>;
}

export interface Source {
    /** Checks whether the data might be parsable given the header. */
    hasValidHeader(transactionData: string): boolean;
    /**
     * Loads the source transactions from the given data.
     * Note: Does not sort the resulting transactions.
     */
    parseTransactions(transactionData: string): Array<SourceTransaction>;
}

export class SourcesImpl implements Sources {
    constructor() {}
    public parseTransactions(
        transactionsData: string,
    ): Array<SourceTransaction> {
        const sources: Array<Source> = [
            new INGBankCSVSource(),
            new SNSBankCSVSource(),
        ];

        for (const source of sources) {
            if (source.hasValidHeader(transactionsData)) {
                const transactions = source.parseTransactions(transactionsData);

                if (transactions.length === 0) {
                    throw new Error(
                        "No transactions were present in the given data",
                    );
                } else {
                    return transactions.sort(
                        (a, b) => a.date.getTime() - b.date.getTime(),
                    );
                }
            }
        }

        throw new Error("Could not parse transactions: unrecognized format");
    }
}
