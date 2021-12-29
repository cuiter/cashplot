import {
    SourceDataInfo,
    SourceDataInfoItem,
    SourceTransaction,
} from "../types";
import { Persistence, Sources, State, Transactions } from "../interfaces";

class SourceData {
    constructor(
        public name: string,
        public transactions: SourceTransaction[],
    ) {}
}

export class StateImpl implements State {
    public static inject = ["sources", "transactions", "persistence"] as const;

    private sourceDatas: SourceData[] = [];
    // Note: re-generated whenever sourceDatas changes.
    private sourceDataInfo: SourceDataInfo;

    constructor(
        private sources: Sources,
        private transactions: Transactions,
        private persistence: Persistence,
    ) {
        this.sourceDataInfo = new SourceDataInfo();
    }

    public init() {
        for (const name of this.persistence.listSourceDataNames()) {
            this.addSourceData(
                name,
                this.persistence.loadSourceData(name).transactionData,
            );
        }
    }

    private findNewName(name: string) {
        var newName = name;
        var index = 1;
        while (this.sourceDatas.map((tr) => tr.name).indexOf(newName) !== -1) {
            newName = `${name} (${index})`;
            index++;
        }
        return newName;
    }

    public addSourceData(name: string, transactionData: string): void {
        const newName = this.findNewName(name);
        const transactions = this.sources.parseTransactions(transactionData);
        this.sourceDatas.push(new SourceData(newName, transactions));

        this.persistence.storeSourceData(name, transactionData);
        this.updateSourceDataInfo();
    }

    public removeSourceData(name: string): void {
        this.sourceDatas = this.sourceDatas.filter(
            (sourceData) => sourceData.name !== name,
        );
        this.persistence.removeSourceData(name);

        this.updateSourceDataInfo();
    }

    private updateSourceDataInfo(): void {
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

        const combinedTransactions = this.transactions.combineSources(
            this.sourceDatas.map((s) => s.transactions),
        );
        this.sourceDataInfo.totalTransactions = combinedTransactions.length;
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

    public allSourceDataInfo(): SourceDataInfo {
        return this.sourceDataInfo;
    }
}
