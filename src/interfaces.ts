import {
    Preferences,
    Settings,
    SourceDataInfo,
    SourceTransaction,
} from "./types";

export interface UI {
    init(): void;
}

export interface State {
    /* Initializes and restores state from previous session if available */
    init(): void;
    /**
     * Loads source data (for example file contents) into the collection of loaded sources.
     * If source data with the given name already exists, stores the data under a new name.
     * Throws an error if the provided transactions data could not be parsed.
     */
    addSourceData(name: string, transactionsData: string): void;
    /**
     * Removes the source data associated with the given name.
     * Note: No-op if the name doesn't exist in the collection.
     */
    removeSourceData(name: string): void;
    /** Returns information about the loaded source data items. */
    allSourceDataInfo(): SourceDataInfo;
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

export interface Transactions {
    combineSources(
        transactions: Array<Array<SourceTransaction>>,
    ): Array<SourceTransaction>;
}

export interface Persistence {
    loadSettings(): Settings | null;
    storeSettings(settings: Settings): void;

    loadPreferences(): Preferences | null;
    storePreferences(preferences: Preferences): void;

    listSourceDataNames(): string[];
    storeSourceData(name: string, transactionData: string): void;
    loadSourceData(name: string): { transactionData: string };
    removeSourceData(name: string): void;
}

export interface PersistenceDriver {
    loadObject(section: string): object | null;
    storeObject(section: string, object: object): void;

    loadHugeText(section: string): string | null;
    storeHugeText(section: string, text: string): void;

    listSections(): string[];
    removeSection(section: string): void;
}
