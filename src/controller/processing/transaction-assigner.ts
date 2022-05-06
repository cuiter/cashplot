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
    TextFilter,
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
        const matches: Record<number, Assignment[]> = {};

        const addToMatches = (transactionHash: number, match: Assignment) => {
            if (matches[transactionHash] === undefined) {
                matches[transactionHash] = [match];
            } else {
                matches[transactionHash].push(match);
            }
        };

        for (const category of categories) {
            for (const filter of category.filters) {
                if (filter instanceof ManualFilter) {
                    const manualFilter = filter as ManualFilter;

                    addToMatches(
                        manualFilter.transactionHash,
                        new Assignment(
                            category.name,
                            "Category",
                            manualFilter.id,
                            "ManualFilter",
                        ),
                    );
                } else if (filter instanceof TextFilter) {
                    const matchers = filter.getMatchers();
                    for (const transaction of transactions) {
                        if (
                            (matchers.contraAccount.test(
                                transaction.contraAccount ?? "",
                            ) ||
                                matchers.contraAccount.test(
                                    transaction.contraAccountName ?? "",
                                )) &&
                            matchers.description.test(transaction.description)
                        ) {
                            addToMatches(
                                transaction.hash,
                                new Assignment(
                                    category.name,
                                    "Category",
                                    filter.id,
                                    "TextFilter",
                                ),
                            );
                        }
                    }
                }
            }
        }

        const assignedTransactions = [];

        for (const transaction of transactions) {
            assignedTransactions.push(
                new AssignedTransaction(
                    transaction,
                    matches[transaction.hash] || [],
                ),
            );
        }

        return assignedTransactions;
    }
}
