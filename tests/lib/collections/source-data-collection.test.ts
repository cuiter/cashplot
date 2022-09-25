/* eslint-disable @typescript-eslint/no-explicit-any */
import { createInjector } from "typed-inject";
import { SourceDataCollectionImpl } from "../../../src/lib/collections/source-data-collection";
import { DECIMAL, Preferences, Settings, SourceTransaction } from "../../../src/lib/entities";
import { Storage } from "../../../src/lib/storage";
import { Sources } from "../../../src/lib/sources";

class SourcesMock implements Sources {
    public parseTransactions(transactionData: string): SourceTransaction[] {
        if (transactionData === "<mock1>") {
            return [
                new SourceTransaction(
                    new Date("2021-11-16"),
                    -200 * DECIMAL,
                    "NL00SCND0987654321",
                    "NL23ABNA9349042743",
                    "Robot Computer Shop",
                    "Invoice 934830293, laptop model VT94",
                ),
                new SourceTransaction(
                    new Date("2021-11-13"),
                    -20 * DECIMAL,
                    "NL00MAIN1234567890",
                    "NL98INGB2152156592",
                    "Mr. John",
                    "Lunch",
                ),
                new SourceTransaction(
                    new Date("2021-11-02"),
                    -430 * DECIMAL,
                    "NL00MAIN1234567890",
                    "NL23ABNA9349042743",
                    "Mike's Tire Repairs",
                    "13th of November tire sale, 4x sports tires",
                ),
            ];
        } else {
            return [
                new SourceTransaction(
                    new Date("2021-11-13"),
                    20 * DECIMAL,
                    "NL98INGB2152156592",
                    "NL00MAIN1234567890",
                    "Mr. G",
                    "Lunch",
                ),
            ];
        }
    }
}

export class StorageMock implements Storage {
    private settings: Settings | null = null;
    private preferences: Preferences | null = null;
    private sourceData: { [name: string]: string } = {};

    public loadSettings() {
        return this.settings;
    }
    public storeSettings(settings: Settings) {
        this.settings = settings;
    }
    public loadPreferences() {
        return this.preferences;
    }
    public storePreferences(preferences: Preferences) {
        this.preferences = preferences;
    }
    public listSourceDataNames() {
        return Object.keys(this.sourceData);
    }
    public storeSourceData(name: string, transactionData: string) {
        this.sourceData[name] = transactionData;
    }
    public loadSourceData(name: string) {
        return { transactionData: this.sourceData[name] };
    }
    public removeSourceData(name: string) {
        delete this.sourceData[name];
    }

    exportJson(): string {
        throw new Error("Not implemented.");
    }
    importJson(_jsonData: string) {
        throw new Error("Not implemented.");
    }
}

describe("SourceDataCollectionImpl", () => {
    const injector = createInjector().provideClass("sources", SourcesMock);

    test("should load previously stored persistent source data to its collection", () => {
        const storageMock = new StorageMock();
        storageMock.storeSourceData("data1.csv", "<mock1>");
        storageMock.storeSourceData("data2.csv", "<mock2>");
        const sourceDataCollection = injector
            .provideValue("storage", storageMock)
            .injectClass(SourceDataCollectionImpl);

        sourceDataCollection.init();

        expect((sourceDataCollection as any).sourceDatas.length).toBe(2);
        expect((sourceDataCollection as any).sourceDatas[0].name).toBe("data1.csv");
        expect((sourceDataCollection as any).sourceDatas[0].transactions.length).toBe(3);
        expect((sourceDataCollection as any).sourceDatas[1].name).toBe("data2.csv");
        expect((sourceDataCollection as any).sourceDatas[1].transactions.length).toBe(1);
    });

    test("should merge transactions from multiple sources", () => {
        const storageMock = new StorageMock();
        const sourceDataCollection = injector
            .provideValue("storage", storageMock)
            .injectClass(SourceDataCollectionImpl);

        sourceDataCollection.add("data1.csv", "<mock1>");
        sourceDataCollection.add("data2.csv", "<mock2>");

        const transactions = sourceDataCollection.allTransactions();

        // Duplicate entries are removed
        expect(transactions.length).toBe(3);
        // Transactions are sorted by date ascending
        expect(transactions[0].date).toEqual(new Date("2021-11-02"));
        expect(transactions[1].date).toEqual(new Date("2021-11-13"));
        expect(transactions[2].date).toEqual(new Date("2021-11-16"));

        // The load order should not matter
        const secondStorageMock = new StorageMock();
        const secondSourceDataCollection = injector
            .provideValue("storage", secondStorageMock)
            .injectClass(SourceDataCollectionImpl);

        secondSourceDataCollection.add("data2.csv", "<mock2>");
        secondSourceDataCollection.add("data1.csv", "<mock1>");

        const secondTransactions = secondSourceDataCollection.allTransactions();

        expect(secondTransactions.length).toBe(3);
        expect(secondTransactions[0].date).toEqual(new Date("2021-11-02"));
        expect(secondTransactions[1].date).toEqual(new Date("2021-11-13"));
        expect(secondTransactions[2].date).toEqual(new Date("2021-11-16"));
    });

    test("should add source data (including transactions) to its (persistent) collection", () => {
        const storageMock = new StorageMock();
        const sourceDataCollection = injector
            .provideValue("storage", storageMock)
            .injectClass(SourceDataCollectionImpl);

        sourceDataCollection.add("data1.csv", "<mock1>");
        sourceDataCollection.add("data2.csv", "<mock2>");

        expect((sourceDataCollection as any).sourceDatas.length).toBe(2);
        expect((sourceDataCollection as any).sourceDatas[0].name).toBe("data1.csv");
        expect((sourceDataCollection as any).sourceDatas[0].transactions.length).toBe(3);
        expect((sourceDataCollection as any).sourceDatas[1].name).toBe("data2.csv");
        expect((sourceDataCollection as any).sourceDatas[1].transactions.length).toBe(1);

        expect(storageMock.listSourceDataNames()).toEqual(["data1.csv", "data2.csv"]);
    });

    test("should select a new name when adding source data if necessary", () => {
        const sourceDataCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(SourceDataCollectionImpl);

        sourceDataCollection.add("data1.csv", "<mock1>");
        sourceDataCollection.add("data1.csv", "<mock1>");
        sourceDataCollection.add("data1.csv", "<mock1>");

        expect((sourceDataCollection as any).sourceDatas.length).toBe(3);
        expect((sourceDataCollection as any).sourceDatas[0].name).toBe("data1.csv");
        expect((sourceDataCollection as any).sourceDatas[1].name).toBe("data1.csv (1)");
        expect((sourceDataCollection as any).sourceDatas[2].name).toBe("data1.csv (2)");
        expect((sourceDataCollection as any).sourceDatas[0].transactions.length).toBe(3);
        expect((sourceDataCollection as any).sourceDatas[1].transactions.length).toBe(3);
        expect((sourceDataCollection as any).sourceDatas[2].transactions.length).toBe(3);
    });

    test("should remove source source data from its collection", () => {
        const storageMock = new StorageMock();
        const sourceDataCollection = injector
            .provideValue("storage", storageMock)
            .injectClass(SourceDataCollectionImpl);

        sourceDataCollection.add("data1.csv", "<mock1>");
        sourceDataCollection.add("data2.csv", "<mock2>");

        sourceDataCollection.remove("data1.csv");

        expect((sourceDataCollection as any).sourceDatas.length).toBe(1);
        expect((sourceDataCollection as any).sourceDatas[0].name).toBe("data2.csv");

        sourceDataCollection.remove("data2.csv");

        expect((sourceDataCollection as any).sourceDatas.length).toBe(0);
        expect(storageMock.listSourceDataNames().length).toBe(0);

        // Note: should not throw if the data has already been removed
        sourceDataCollection.remove("data2.csv");
    });

    test("should provide information on the source data in its collection", () => {
        const sourceDataCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(SourceDataCollectionImpl);

        sourceDataCollection.add("data1.csv", "<mock1>");
        sourceDataCollection.add("data2.csv", "<mock2>");

        const info = sourceDataCollection.allInfo();

        expect(info.totalAccounts).toBe(3);
        expect(info.totalTransactions).toBe(3);

        expect(info.items.length).toBe(2);
        expect(info.items[0].name).toBe("data1.csv");
        expect(info.items[0].startDate).toEqual(new Date("2021-11-02"));
        expect(info.items[0].endDate).toEqual(new Date("2021-11-16"));
        expect(info.items[0].nAccounts).toBe(2);
        expect(info.items[0].nTransactions).toBe(3);

        expect(info.items[1].name).toBe("data2.csv");
        expect(info.items[1].startDate).toEqual(new Date("2021-11-13"));
        expect(info.items[1].endDate).toEqual(new Date("2021-11-13"));
        expect(info.items[1].nAccounts).toBe(1);
        expect(info.items[1].nTransactions).toBe(1);
    });
});