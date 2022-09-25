import { SourceDataInfo, SourceDataInfoItem, SourceTransaction } from "../../model/entities";
import { Storage } from "../../model/storage";
import { Sources } from "../../controller/sources";
import { findNewName } from "../../utils";
import { Observable } from "@daign/observable";

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

class SourceData {
    constructor(public name: string, public transactions: SourceTransaction[]) {}
}

export class SourceDataCollectionImpl extends Observable implements SourceDataCollection {
    public static inject = ["sources", "storage"] as const;

    private sourceDatas: SourceData[] = [];
    // Note: re-generated whenever sourceDatas changes.
    private sourceDataInfo: SourceDataInfo;
    private sourceTransactions: SourceTransaction[] = [];

    constructor(private sources: Sources, private storage: Storage) {
        super();

        this.sourceDataInfo = new SourceDataInfo();

        // Update info when changes are made
        this.subscribeToChanges(() => {
            this.updateInfo();
        });
    }

    public init() {
        for (const name of this.storage.listSourceDataNames()) {
            this.add(name, this.storage.loadSourceData(name).transactionData);
        }
    }

    public add(name: string, transactionData: string): void {
        const newName = findNewName(
            name,
            this.sourceDatas.map((sd) => sd.name),
        );
        const transactions = this.sources.parseTransactions(transactionData);
        this.sourceDatas.push(new SourceData(newName, transactions));
        this.insertTransactions(transactions);

        this.storage.storeSourceData(name, transactionData);
        this.notifyObservers();
    }

    public remove(name: string): void {
        this.sourceDatas = this.sourceDatas.filter((sourceData) => sourceData.name !== name);

        // Re-build the sourceTransactions array.
        this.sourceTransactions = [];
        for (const sourceData of this.sourceDatas) {
            this.insertTransactions(sourceData.transactions);
        }

        this.storage.removeSourceData(name);

        this.notifyObservers();
    }

    /**
     * Inserts new transactions into the this.sourceTransactions array.
     * Removes duplicate entries and sorts transactions by date ascending.
     * Note: Runs in O(nW | n log n) time, where W is the max amount of transactions on any given date.
     */
    private insertTransactions(newTransactions: SourceTransaction[]) {
        newTransactions = newTransactions.sort((a, b) => a.date.getTime() - b.date.getTime());

        // Checks whether two transactions are equal to each other.
        // Note: Opposite transactions are considered equal.
        function transactionsAreEqual(transaction: SourceTransaction, other: SourceTransaction) {
            if (transaction.date.getTime() != other.date.getTime()) return false;

            if (transaction.account === other.account) {
                return transaction.amount === other.amount;
            } else if (transaction.account === other.contraAccount) {
                return transaction.amount === -other.amount;
            } else {
                return false;
            }
        }

        // Put combined transactions into a new array instead of splicing into the existing array.
        const combinedTransactions = [];

        let existingIndex = 0;
        let newIndex = 0;

        while (newIndex < newTransactions.length) {
            while (
                existingIndex < this.sourceTransactions.length &&
                this.sourceTransactions[existingIndex].date.getTime() <
                    newTransactions[newIndex].date.getTime()
            ) {
                combinedTransactions.push(this.sourceTransactions[existingIndex]);
                existingIndex++;
            }

            if (existingIndex == this.sourceTransactions.length) {
                combinedTransactions.push(...newTransactions.slice(newIndex));
                break;
            } else {
                const newTransaction = newTransactions[newIndex];
                let existingSameDateIndex = existingIndex;
                let foundSameTransaction = false;
                while (
                    existingSameDateIndex < this.sourceTransactions.length &&
                    this.sourceTransactions[existingSameDateIndex].date.getTime() ==
                        newTransaction.date.getTime()
                ) {
                    if (
                        transactionsAreEqual(
                            this.sourceTransactions[existingSameDateIndex],
                            newTransaction,
                        )
                    ) {
                        foundSameTransaction = true;
                        break;
                    }
                    existingSameDateIndex++;
                }

                if (!foundSameTransaction) {
                    combinedTransactions.push(newTransaction);
                }
            }

            newIndex++;
        }

        combinedTransactions.push(...this.sourceTransactions.slice(existingIndex));

        this.sourceTransactions = combinedTransactions;
    }

    private updateInfo(): void {
        const newInfoItems = this.sourceDatas.map((sourceData) => {
            return new SourceDataInfoItem(
                sourceData.name,
                sourceData.transactions[0].date,
                sourceData.transactions[sourceData.transactions.length - 1].date,
                sourceData.transactions
                    .map((tr) => tr.account)
                    .filter(
                        // Filter out non-unique elements
                        (value, index, self) => self.indexOf(value) === index,
                    ).length,
                sourceData.transactions.length,
            );
        });

        // Modify the contents, but keep the array reference the same.
        // May allow for future performance optimizations.
        this.sourceDataInfo.items.splice(0, this.sourceDataInfo.items.length);
        for (const sourceDataInfo of newInfoItems) {
            this.sourceDataInfo.items.push(sourceDataInfo);
        }

        this.sourceDataInfo.totalTransactions = this.sourceTransactions.length;
        // this.transactions.combineSources may have combined some transactions
        // containing unique source accounts, hence the use of all source transactions below.
        this.sourceDataInfo.totalAccounts = this.sourceDatas
            .map((sourceData) => sourceData.transactions)
            .flat()
            .map((tr) => tr.account)
            .filter(
                // Filter out non-unique elements
                (value, index, self) => self.indexOf(value) === index,
            ).length;
    }

    public allInfo(): SourceDataInfo {
        return this.sourceDataInfo;
    }

    public allTransactions(): SourceTransaction[] {
        return this.sourceTransactions;
    }
}
