import { createInjector } from "typed-inject";
import { StateImpl } from "../src/components/state";
import {
    DECIMAL,
    Preferences,
    Settings,
    SourceTransaction,
} from "../src/types";
import { Persistence, Source, Sources, Transactions } from "../src/interfaces";

class SourcesMock implements Sources {
    public parseTransactions(transactionData: string): SourceTransaction[] {
        if (transactionData === "<mock1>") {
            return [
                new SourceTransaction(
                    new Date("2021-11-02"),
                    -20 * DECIMAL,
                    "NL00MAIN1234567890",
                    "NL98INGB2152156592",
                    "Mr. John",
                    "Lunch",
                ),
                new SourceTransaction(
                    new Date("2021-11-13"),
                    -430 * DECIMAL,
                    "NL00MAIN1234567890",
                    "NL23ABNA9349042743",
                    "Mike's Tire Repairs",
                    "13th of November tire sale, 4x sports tires",
                ),
                new SourceTransaction(
                    new Date("2021-11-16"),
                    -200 * DECIMAL,
                    "NL00SCND0987654321",
                    "NL23ABNA9349042743",
                    "Robot Computer Shop",
                    "Invoice 934830293, laptop model VT94",
                ),
            ];
        } else {
            return [
                new SourceTransaction(
                    new Date("2021-11-03"),
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

class TransactionsMock implements Transactions {
    public combineSources(
        transactions: SourceTransaction[][],
    ): SourceTransaction[] {
        return [
            new SourceTransaction(
                new Date("2021-11-02"),
                -20 * DECIMAL,
                "NL00MAIN1234567890",
                "NL98INGB2152156592",
                "Mr. John",
                "Lunch",
            ),
            new SourceTransaction(
                new Date("2021-11-13"),
                -430 * DECIMAL,
                "NL00MAIN1234567890",
                "NL23ABNA9349042743",
                "Mike's Tire Repairs",
                "13th of November tire sale, 4x sports tires",
            ),
            new SourceTransaction(
                new Date("2021-11-16"),
                -200 * DECIMAL,
                "NL00SCND0987654321",
                "NL23ABNA9349042743",
                "Robot Computer Shop",
                "Invoice 934830293, laptop model VT94",
            ),
        ];
    }
}

class PersistenceMock implements Persistence {
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
}

describe("StateImpl", () => {
    const injector = createInjector()
        .provideClass("sources", SourcesMock)
        .provideClass("transactions", TransactionsMock);

    test("should load previously stored persistent source data to its collection", () => {
        const persistenceMock = new PersistenceMock();
        persistenceMock.storeSourceData("data1.csv", "<mock1>");
        persistenceMock.storeSourceData("data2.csv", "<mock2>");
        const state = injector
            .provideValue("persistence", persistenceMock)
            .injectClass(StateImpl);

        state.init();

        expect((state as any).sourceDatas.length).toBe(2);
        expect((state as any).sourceDatas[0].name).toBe("data1.csv");
        expect((state as any).sourceDatas[0].transactions.length).toBe(3);
        expect((state as any).sourceDatas[1].name).toBe("data2.csv");
        expect((state as any).sourceDatas[1].transactions.length).toBe(1);
    });

    test("should add source data (including transactions) to its (persistent) collection", () => {
        const persistenceMock = new PersistenceMock();
        const state = injector
            .provideValue("persistence", persistenceMock)
            .injectClass(StateImpl);

        state.addSourceData("data1.csv", "<mock1>");
        state.addSourceData("data2.csv", "<mock2>");

        expect((state as any).sourceDatas.length).toBe(2);
        expect((state as any).sourceDatas[0].name).toBe("data1.csv");
        expect((state as any).sourceDatas[0].transactions.length).toBe(3);
        expect((state as any).sourceDatas[1].name).toBe("data2.csv");
        expect((state as any).sourceDatas[1].transactions.length).toBe(1);

        expect(persistenceMock.listSourceDataNames()).toEqual([
            "data1.csv",
            "data2.csv",
        ]);
    });

    test("should select a new name when adding source data if necessary", () => {
        const state = injector
            .provideClass("persistence", PersistenceMock)
            .injectClass(StateImpl);

        state.addSourceData("data1.csv", "<mock1>");
        state.addSourceData("data1.csv", "<mock1>");
        state.addSourceData("data1.csv", "<mock1>");

        expect((state as any).sourceDatas.length).toBe(3);
        expect((state as any).sourceDatas[0].name).toBe("data1.csv");
        expect((state as any).sourceDatas[1].name).toBe("data1.csv (1)");
        expect((state as any).sourceDatas[2].name).toBe("data1.csv (2)");
        expect((state as any).sourceDatas[0].transactions.length).toBe(3);
        expect((state as any).sourceDatas[1].transactions.length).toBe(3);
        expect((state as any).sourceDatas[2].transactions.length).toBe(3);
    });

    test("should remove source source data from its collection", () => {
        const persistenceMock = new PersistenceMock();
        const state = injector
            .provideValue("persistence", persistenceMock)
            .injectClass(StateImpl);

        state.addSourceData("data1.csv", "<mock1>");
        state.addSourceData("data2.csv", "<mock2>");

        state.removeSourceData("data1.csv");

        expect((state as any).sourceDatas.length).toBe(1);
        expect((state as any).sourceDatas[0].name).toBe("data2.csv");

        state.removeSourceData("data2.csv");

        expect((state as any).sourceDatas.length).toBe(0);
        expect(persistenceMock.listSourceDataNames().length).toBe(0);

        // Note: should not throw if the data has already been removed
        state.removeSourceData("data2.csv");
    });

    test("should provide information on the source data in its collection", () => {
        const state = injector
            .provideClass("persistence", PersistenceMock)
            .injectClass(StateImpl);

        state.addSourceData("data1.csv", "<mock1>");
        state.addSourceData("data2.csv", "<mock2>");

        const info = state.allSourceDataInfo();

        expect(info.totalAccounts).toBe(3);
        expect(info.totalTransactions).toBe(3);

        expect(info.items.length).toBe(2);
        expect(info.items[0].name).toBe("data1.csv");
        expect(info.items[0].startDate).toEqual(new Date("2021-11-02"));
        expect(info.items[0].endDate).toEqual(new Date("2021-11-16"));
        expect(info.items[0].nAccounts).toBe(2);
        expect(info.items[0].nTransactions).toBe(3);

        expect(info.items[1].name).toBe("data2.csv");
        expect(info.items[1].startDate).toEqual(new Date("2021-11-03"));
        expect(info.items[1].endDate).toEqual(new Date("2021-11-03"));
        expect(info.items[1].nAccounts).toBe(1);
        expect(info.items[1].nTransactions).toBe(1);
    });
});
