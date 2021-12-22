import { SourceTransaction } from "./types";
import { Transactions } from "./interfaces";

export class TransactionsImpl implements Transactions {
    constructor() {}

    /**
     * Combines multiple arrays of transactions into one.
     * Discards duplicate transactions and sorts the end result by date ascending.
     */
    public combineSources(
        transactionLists: Array<Array<SourceTransaction>>,
    ): Array<SourceTransaction> {
        if (transactionLists.length === 0) return [];

        var sortedTransactionLists = transactionLists.map((transactionList) =>
            transactionList.sort((a, b) => a.date.getTime() - b.date.getTime()),
        );

        var startDate = sortedTransactionLists
            .map((trs) => trs[0].date)
            .sort((a, b) => a.getTime() - b.getTime());
        var endDate = sortedTransactionLists
            .map((trs) => trs[trs.length - 1].date)
            .sort((a, b) => b.getTime() - a.getTime());

        var transactions = sortedTransactionLists[0];

        for (var transaction of sortedTransactionLists.slice(1).flat()) {
            if (
                !transactions.some(
                    (tr) =>
                        tr.date.getTime() === transaction.date.getTime() &&
                        tr.amount === -transaction.amount &&
                        tr.account === transaction.contraAccount,
                )
            ) {
                transactions.push(transaction);
            }
        }

        return transactions;
    }
}
