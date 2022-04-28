import { SourceTransaction } from "../model/entities";
import { Transactions } from "../interfaces";

export class TransactionsImpl implements Transactions {
    constructor() {}

    /**
     * Combines multiple arrays of transactions into one.
     * Discards duplicate transactions from different arrays
     * and sorts the end result by date ascending.
     * NOTE: Assumes that each transaction array does not contain duplicates.
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

        for (var transactionArray of sortedTransactionLists.slice(1)) {
            var transactionHashes = transactions.map((tr) => tr.hash);

            transactions = transactions.concat(
                transactionArray.filter(
                    (transaction) =>
                        // Check for duplicate transactions
                        transactionHashes.indexOf(transaction.hash) === -1 &&
                        !transactions.some(
                            (tr) =>
                                tr.date.getTime() ===
                                    transaction.date.getTime() && // Check for duplicate transactions on the receiver's end
                                tr.amount === -transaction.amount &&
                                tr.account === transaction.contraAccount,
                        ),
                ),
            );
        }

        return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
}
