import { TransactionAssigner } from "../../interfaces";
import {
    SourceTransaction,
    Account,
    Category,
    AssignedTransaction,
    ManualFilter,
} from "../../model/entities";

export class TransactionAssignerImpl implements TransactionAssigner {
    assignTransactions(
        transactions: SourceTransaction[],
        accounts: Account[],
        categories: Category[],
    ): AssignedTransaction[] {
        const manualMatches: Record<number, Category[]> = {};

        for (const category of categories) {
            for (const filter of category.filters) {
                if (filter instanceof ManualFilter) {
                    const manualFilter = filter as ManualFilter;

                    if (
                        manualMatches[manualFilter.transactionHash] ===
                        undefined
                    ) {
                        manualMatches[manualFilter.transactionHash] = [];
                    }

                    manualMatches[manualFilter.transactionHash].push(category);
                }
            }
        }

        const assignedTransactions = [];

        for (const transaction of transactions) {
            assignedTransactions.push(
                new AssignedTransaction(
                    transaction,
                    manualMatches[transaction.hash] || [],
                    null,
                    null,
                ),
            );
        }

        return assignedTransactions;
    }
}
