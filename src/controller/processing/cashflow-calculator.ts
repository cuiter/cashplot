import { Observable } from "@daign/observable";
import { TransactionSearcher } from "./transaction-searcher";
import { MAX_CACHE_ENTRIES, SearchQuery } from "../../model/entities";

/**
 * Calculates the total cash flow (income / expenses) of transactions matching a specific search query.
 *
 * Uses a cache to save results for recent queries.
 */
export interface CashFlowCalculator {
    calculateCashFlow(searchQuery: SearchQuery): {
        income: number;
        expenses: number;
    };
}

export class CashFlowCalculatorImpl
    extends Observable
    implements CashFlowCalculator
{
    public static inject = ["searcher"] as const;

    private searchCache: {
        query: SearchQuery;
        result: { income: number; expenses: number };
    }[] = [];

    constructor(public searcher: TransactionSearcher) {
        super();
        this.searcher.subscribeToChanges(() => {
            this.searchCache = []; // Invalidate cache
        });
    }

    calculateCashFlow(query: SearchQuery): {
        income: number;
        expenses: number;
    } {
        for (const cacheEntry of this.searchCache) {
            if (
                cacheEntry.query.categoryName === query.categoryName &&
                cacheEntry.query.accountId === query.accountId &&
                cacheEntry.query.filterType === query.filterType &&
                cacheEntry.query.filterId === query.filterId &&
                cacheEntry.query.period?.type === query.period?.type &&
                cacheEntry.query.period?.year === query.period?.year &&
                cacheEntry.query.period?.periodNumber ===
                    query.period?.periodNumber
            ) {
                return cacheEntry.result;
            }
        }

        const transactions = this.searcher.searchTransactions(query);

        let totalIncome = 0;
        let totalExpenses = 0;

        for (const transaction of transactions) {
            if (transaction.amount > 0) {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += -transaction.amount;
            }
        }

        const result = { income: totalIncome, expenses: totalExpenses };

        if (this.searchCache.length >= MAX_CACHE_ENTRIES) {
            // Remove oldest cache entry
            this.searchCache.splice(0, 1);
        }

        this.searchCache.push({
            query: Object.assign({}, query), // Copy query object
            result: result,
        });

        return result;
    }
}
