import { TransactionAssigner, TransactionSearcher } from "../../interfaces";
import { AssignedTransaction, SearchQuery } from "../../model/entities";

const MAX_CACHE_ENTRIES = 5;

export class TransactionSearcherImpl implements TransactionSearcher {
    public static inject = ["assigner"] as const;

    private searchCache: {
        query: SearchQuery;
        results: AssignedTransaction[];
    }[] = [];

    constructor(public assigner: TransactionAssigner) {
        this.assigner.subscribeToChanges(() => {
            this.searchCache = []; // Invalidate cache
        });
    }

    searchTransactions(query: SearchQuery): AssignedTransaction[] {
        for (const cacheEntry of this.searchCache) {
            if (
                cacheEntry.query.categoryName === query.categoryName &&
                cacheEntry.query.accountId === query.accountId &&
                cacheEntry.query.filterType === query.filterType &&
                cacheEntry.query.filterId === query.filterId
            ) {
                return cacheEntry.results;
            }
        }

        const allTransactions = this.assigner.allTransactions();

        const results = allTransactions.filter((transaction) =>
            transaction.assignments.some(
                (filter) =>
                    (filter.name === query.categoryName ||
                        query.categoryName === undefined) &&
                    filter.type === "Category" &&
                    (filter.filterType === query.filterType ||
                        query.filterType === undefined) &&
                    (filter.filterId === query.filterId ||
                        query.filterId === undefined),
            ),
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
