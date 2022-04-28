import {
    Category,
    Settings,
    SourceDataInfo,
    SourceDataInfoItem,
    SourceTransaction,
} from "../../model/types";
import {
    Storage,
    Sources,
    SourceDataCollection,
    Transactions,
} from "../../interfaces";
import { findNewName } from "../../utils";

class SourceData {
    constructor(
        public name: string,
        public transactions: SourceTransaction[],
    ) {}
}

export class SourceDataCollectionImpl implements SourceDataCollection {
    public static inject = ["sources", "transactions", "storage"] as const;

    private sourceDatas: SourceData[] = [];
    // Note: re-generated whenever sourceDatas changes.
    private sourceDataInfo: SourceDataInfo;
    private sourceTransactions: SourceTransaction[] = [];

    private settings: Settings;

    constructor(
        private sources: Sources,
        private transactions: Transactions,
        private storage: Storage,
    ) {
        this.sourceDataInfo = new SourceDataInfo();
        this.settings = new Settings();
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

        this.storage.storeSourceData(name, transactionData);
        this.updateInfo();
    }

    public remove(name: string): void {
        this.sourceDatas = this.sourceDatas.filter(
            (sourceData) => sourceData.name !== name,
        );
        this.storage.removeSourceData(name);

        this.updateInfo();
    }

    private updateInfo(): void {
        const newInfoItems = this.sourceDatas.map((sourceData) => {
            return new SourceDataInfoItem(
                sourceData.name,
                sourceData.transactions[0].date,
                sourceData.transactions[
                    sourceData.transactions.length - 1
                ].date,
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

        this.sourceTransactions = this.transactions.combineSources(
            this.sourceDatas.map((s) => s.transactions),
        );
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
