import { Observable } from "@daign/observable";
import { TransactionAssigner } from "./transaction-assigner";
import { AssignedTransaction, MAX_CACHE_ENTRIES, SearchQuery } from "../../model/entities";

/**
 * Takes assigned transactions from TransactionAssigner and performs search queries.
 *
 * Uses a cache to save results for recent queries.
 */
export interface TransactionSearcher {
    searchTransactions(searchQuery: SearchQuery): AssignedTransaction[];
    /** Allows another component to subscribe to any changes in this component. */
    subscribeToChanges(callback: () => void): void;
}

export class TransactionSearcherImpl extends Observable implements TransactionSearcher {
    public static inject = ["assigner"] as const;

    private searchCache: {
        query: SearchQuery;
        results: AssignedTransaction[];
    }[] = [];

    constructor(public assigner: TransactionAssigner) {
        super();
        this.assigner.subscribeToChanges(() => {
            this.searchCache = []; // Invalidate cache
            this.notifyObservers();
        });
    }

    searchTransactions(query: SearchQuery): AssignedTransaction[] {
        for (const cacheEntry of this.searchCache) {
            if (
                cacheEntry.query.categoryName === query.categoryName &&
                cacheEntry.query.accountId === query.accountId &&
                cacheEntry.query.filterType === query.filterType &&
                cacheEntry.query.filterId === query.filterId &&
                cacheEntry.query.period?.type === query.period?.type &&
                cacheEntry.query.period?.year === query.period?.year &&
                cacheEntry.query.period?.periodNumber === query.period?.periodNumber
            ) {
                return cacheEntry.results;
            }
        }

        const allTransactions = this.assigner.allTransactions();

        const results = allTransactions.filter(
            (transaction) =>
                transaction.assignments.some(
                    (filter) =>
                        (filter.name === query.categoryName || query.categoryName === undefined) &&
                        filter.type === "Category" &&
                        (filter.filterType === query.filterType || query.filterType === undefined) &&
                        (filter.filterId === query.filterId || query.filterId === undefined),
                ) &&
                (query.period === undefined || query.period.containsDate(transaction.date)),
        );

        if (this.searchCache.length >= MAX_CACHE_ENTRIES) {
            // Remove oldest cache entry
            this.searchCache.splice(0, 1);
        }

        this.searchCache.push({
            query: Object.assign({}, query), // Copy query object
            results: results,
        });

        return results;
    }
}
