import { SourceDataInfo, SourceTransaction } from "./types";
import { Sources, State } from "./interfaces";

class SourceData {
    constructor(
        public name: string,
        public transactions: SourceTransaction[],
    ) {}
}

export class StateImpl implements State {
    public static inject = ["sources"] as const;

    private sourceDatas: SourceData[] = [];
    // Note: re-generated whenever sourceDatas changes.
    private sourceDataInfos: SourceDataInfo[] = [];

    constructor(private sources: Sources) {}

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
        this.updateSourceDataInfos();
    }

    public removeSourceData(name: string): void {
        this.sourceDatas = this.sourceDatas.filter(
            (sourceData) => sourceData.name !== name,
        );
        this.updateSourceDataInfos();
    }

    private updateSourceDataInfos(): void {
        const newSourceDataInfos = this.sourceDatas.map((sourceData) => {
            return new SourceDataInfo(
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
        this.sourceDataInfos.splice(0, this.sourceDataInfos.length);
        for (const sourceDataInfo of newSourceDataInfos) {
            this.sourceDataInfos.push(sourceDataInfo);
        }
    }

    public allSourceDataInfo(): SourceDataInfo[] {
        return this.sourceDataInfos;
    }
}
