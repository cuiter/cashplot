import { Source, Sources, SourceTransaction } from "../types";
import { INGBankCSVSource } from "./ing-csv";
import { SNSBankCSVSource } from "./sns-csv";
import * as Papa from "papaparse";

export class SourcesImpl implements Sources {
    constructor() {}
    public parseTransactions(
        transactionsData: string,
    ): Array<SourceTransaction> {
        const sources: Array<Source> = [
            new INGBankCSVSource(),
            new SNSBankCSVSource(),
        ];

        for (var source of sources) {
            if (source.hasValidHeader(transactionsData)) {
                return source.parseTransactions(transactionsData);
            }
        }

        throw new Error("Could not parse transactions: unrecognized format");
    }
}
