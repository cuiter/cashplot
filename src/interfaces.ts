import {
    AssignedTransaction,
    Category,
    Filter,
    PeriodType,
    Preferences,
    SearchQuery,
    Settings,
    SourceDataInfo,
    SourceTransaction,
} from "./model/entities";

export interface UI {
    init(): void;
}

export interface SourceDataCollection {
    /** Initializes and restores state from previous session if available */
    init(): void;
    /**
     * Loads source data (for example file contents) into the collection of loaded sources.
     * If source data with the given name already exists, stores the data under a new name.
     * Throws an error if the provided transactions data could not be parsed.
     */
    add(name: string, transactionsData: string): void;
    /**
     * Removes the source data associated with the given name.
     * Note: No-op if the name doesn't exist in the collection.
     */
    remove(name: string): void;
    /** Returns information about the loaded source data items. */
    allInfo(): SourceDataInfo;
    /** Returns the list of all transactions, ordered by date ascending. */
    allTransactions(): SourceTransaction[];
    /** Allows another component to subscribe to any changes in this component. */
    subscribeToChanges(callback: () => void): void;
}

/**
 * Stores a collection of categories, including budgets and filters.
 * Provides methods for modifying the collection.
 */
export interface CategoryCollection {
    /** Initializes storage and restores state from previous session if available */
    init(): void;

    /**
     * Adds a new category to the collection. Returns the new name.
     */
    add(defaultName: string): string;
    /**
     * Removes the category and its associated filters from the collection.
     */
    remove(name: string): void;
    /**
     * Renames a category.
     * Returns whether the rename was successful (i.e. whether there no conflicting category existed).
     */
    rename(name: string, newName: string): boolean;

    /**
     * Sets the budget for the specified category.
     * Note: The budget must be multiplied by entities.DECIMAL to become an integer,
     *       to avoid floating point storage-related inconsistencies.
     */
    setBudget(
        name: string,
        budgetAmount: number | null,
        budgetPeriodType: PeriodType,
    ): void;

    /**
     * Returns the budget for the specified category.
     */
    getBudget(name: string): { amount: number | null; periodType: PeriodType };

    /**
     * Adds filters to the category. If a filter with the same id already exists, it is replaced.
     */
    addFilters(categoryName: string, filters: Filter[]): void;
    /**
     * Removes filters from the category.
     * Note: Throws an error if one of the given filter ids do not exist.
     */
    removeFilters(categoryName: string, filterId: number[]): void;
    /** Returns the filters of the category. */
    getFilters(name: string): Filter[];

    /** Returns the names of all categories. */
    list(): string[];
    /** Returns all categories in the collection. */
    all(): Category[];
    /** Allows another component to subscribe to any changes in this component. */
    subscribeToChanges(callback: () => void): void;
}

/**
  Takes transactions (from SourceDataCollection) and using filters, matches it to categories (from CategoryCollection).
*/
export interface TransactionAssigner {
    /**
     * Returns all transactions after assigning them to their respective categories.
     */
    allTransactions(): AssignedTransaction[];
    /** Allows another component to subscribe to any changes in this component. */
    subscribeToChanges(callback: () => void): void;
}

/**
 * Takes assigned transactions from TransactionAssigner and performs search queries.
 *
 * Uses a cache to save results for recent queries.
 */
export interface TransactionSearcher {
    searchTransactions(searchQuery: SearchQuery): AssignedTransaction[];
}

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

export interface Sources {
    /**
     * Loads the source transactions from the given data.
     * Detects the format and selects the right parser accordingly.
     * Throws an error if the provided transactions data could not be parsed.
     * Throws an error if there were no transactions in the provided data.
     * Note: Sorts the resulting transactions by date ascending.
     */
    parseTransactions(transactionData: string): Array<SourceTransaction>;
}

export interface Source {
    /** Checks whether the data might be parsable given the header. */
    hasValidHeader(transactionData: string): boolean;
    /**
     * Loads the source transactions from the given data.
     * Note: Does not sort the resulting transactions.
     */
    parseTransactions(transactionData: string): Array<SourceTransaction>;
}

export interface Storage {
    loadSettings(): Settings | null;
    storeSettings(settings: Settings): void;

    loadPreferences(): Preferences | null;
    storePreferences(preferences: Preferences): void;

    listSourceDataNames(): string[];
    storeSourceData(name: string, transactionData: string): void;
    loadSourceData(name: string): { transactionData: string };
    removeSourceData(name: string): void;
}

export interface StorageDriver {
    loadObject(section: string): object | null;
    storeObject(section: string, object: object): void;

    loadHugeText(section: string): string | null;
    storeHugeText(section: string, text: string): void;

    listSections(): string[];
    removeSection(section: string): void;
}
