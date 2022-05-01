import { SourceTransaction } from "../../model/entities";
import { Source, Sources } from "../../interfaces";
import { INGBankCSVSource } from "./ing-csv";
import { SNSBankCSVSource } from "./sns-csv";

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
