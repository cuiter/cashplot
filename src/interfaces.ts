import {
    AssignedTransaction,
    Category,
    Filter,
    Preferences,
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

    /*
    To implement:
    get(name: string): Category
    rename(oldName: string, newName: string): void
    setBudget(name: string, monthlyBudget: number): void
    setFilters(name: string, filters: WildcardFilter[]): void
    */

    /**
     * Adds a filter to the category. If a filter with the same id already exists, it is replaced.
     */
    addFilter(categoryName: string, filter: Filter): void;
    /**
     * Removes a filter from the category.
     */
    removeFilter(categoryName: string, filterId: number): void;

    /** Returns the category with the given name. */
    get(name: string): Category;
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
