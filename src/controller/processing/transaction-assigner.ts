import { Observable } from "@daign/observable";
import {
    CategoryCollection,
    SourceDataCollection,
    TransactionAssigner,
} from "../../interfaces";
import {
    SourceTransaction,
    Category,
    AssignedTransaction,
    ManualFilter,
    Assignment,
} from "../../model/entities";

export class TransactionAssignerImpl
    extends Observable
    implements TransactionAssigner
{
    public static inject = ["sourceData", "categories"] as const;

    private assignedTransactions: AssignedTransaction[] = [];
    private updateRequired = false;

    constructor(
        private sourceData: SourceDataCollection,
        private categories: CategoryCollection,
    ) {
        super();
        this.sourceData.subscribeToChanges(() => {
            this.updateRequired = true;
            this.notifyObservers();
        });
        this.categories.subscribeToChanges(() => {
            this.updateRequired = true;
            this.notifyObservers();
        });
    }

    public allTransactions(): AssignedTransaction[] {
        if (this.updateRequired) {
            this.updateTransactions();
            this.updateRequired = false;
        }

        return this.assignedTransactions;
    }

    private updateTransactions() {
        const transactions = this.sourceData.allTransactions();
        const categories = this.categories.all();

        this.assignedTransactions = this.assignTransactions(
            transactions,
            categories,
        );
    }

    private assignTransactions(
        transactions: SourceTransaction[],
        categories: Category[],
    ): AssignedTransaction[] {
        const manualMatches: Record<number, Assignment[]> = {};

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

                    manualMatches[manualFilter.transactionHash].push(
                        new Assignment(
                            category.name,
                            "Category",
                            manualFilter.id,
                            "ManualFilter",
                        ),
                    );
                }
            }
        }

        const assignedTransactions = [];

        for (const transaction of transactions) {
            assignedTransactions.push(
                new AssignedTransaction(
                    transaction,
                    manualMatches[transaction.hash] || [],
                ),
            );
        }

        return assignedTransactions;
    }
}
