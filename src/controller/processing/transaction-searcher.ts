import { TransactionAssigner, TransactionSearcher } from "../../interfaces";
import { AssignedTransaction } from "../../model/entities";

const MAX_CACHE_ENTRIES = 5;

export class TransactionSearcherImpl implements TransactionSearcher {
    public static inject = ["assigner"] as const;

    private searchCache: {
        assignmentName: string | undefined;
        assignmentType: string | undefined;
        filterType: string | undefined;
        filterId: number | undefined;
        results: AssignedTransaction[];
    }[] = [];

    constructor(public assigner: TransactionAssigner) {
        this.assigner.subscribeToChanges(() => {
            this.searchCache = []; // Invalidate cache
        });
    }

    searchTransactions(
        assignmentName?: string,
        assignmentType?: string,
        filterType?: string,
        filterId?: number,
    ): AssignedTransaction[] {
        for (const cacheEntry of this.searchCache) {
            if (
                cacheEntry.assignmentName === assignmentName &&
                cacheEntry.assignmentType === assignmentType &&
                cacheEntry.filterType === filterType &&
                cacheEntry.filterId === filterId
            ) {
                return cacheEntry.results;
            }
        }

        const allTransactions = this.assigner.allTransactions();

        const results = allTransactions.filter((transaction) =>
            transaction.assignments.some(
                (filter) =>
                    (filter.name === assignmentName ||
                        assignmentName === undefined) &&
                    (filter.type === assignmentType ||
                        assignmentType === undefined) &&
                    (filter.filterType === filterType ||
                        filterType === undefined) &&
                    (filter.filterId === filterId || filterId === undefined),
            ),
        );

        if (this.searchCache.length >= MAX_CACHE_ENTRIES) {
            // Remove oldest cache entry
            this.searchCache.splice(0, 1);
        }

        this.searchCache.push({
            assignmentName: assignmentName,
            assignmentType: assignmentType,
            filterType: filterType,
            filterId: filterId,
            results: results,
        });

        return results;
    }
}
