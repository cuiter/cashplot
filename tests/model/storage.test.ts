import { StorageDriver, StorageImpl } from "../../src/model/storage";
import {
    Account,
    Category,
    DECIMAL,
    ManualFilter,
    PeriodType,
    Preferences,
    Settings,
    TextFilter,
} from "../../src/model/entities";

class StorageDriverMock implements StorageDriver {
    private valueStore: any = {}; // eslint-disable-line

    constructor() {}

    loadHugeText(section: string): string | null {
        return Object.prototype.hasOwnProperty.call(this.valueStore, section)
            ? typeof this.valueStore[section] == "string"
                ? this.valueStore[section]
                : JSON.stringify(this.valueStore[section])
            : null;
    }
    storeHugeText(section: string, text: string): void {
        this.valueStore[section] = text;
    }
    listSections(): string[] {
        return Object.keys(this.valueStore);
    }
    removeSection(section: string): void {
        delete this.valueStore[section];
    }
}

const testSettings = new Settings(
    [new Account("NL00SNSB1234567890", "Mr. G", 40 * DECIMAL, true)],
    [
        new Category("Shopping", 300 * DECIMAL, PeriodType.Year, [
            new TextFilter(1, "Bol.com", "wildcard", {
                contraAccount: "bol.com",
                description: "90340932902",
            }),
        ]),
        new Category("Salary", null, PeriodType.Month, [
            new TextFilter(2, "Company", "regexp", {
                contraAccount: "Company Inc\\.",
                description: "Salary for",
            }),
            new ManualFilter(3, 0x320923df),
        ]),
    ],
);
const testStoredSettings = {
    version: 0,
    accounts: [
        {
            account: "NL00SNSB1234567890",
            name: "Mr. G",
            initialBalance: 40 * DECIMAL,
            addToNet: true,
        },
    ],
    categories: [
        {
            name: "Shopping",
            budgetAmount: 300 * DECIMAL,
            budgetPeriodType: "year",
            filters: [
                {
                    id: 1,
                    type: "text",
                    displayName: "Bol.com",
                    matchType: "wildcard",
                    matchPatterns: {
                        contraAccount: "bol.com",
                        description: "90340932902",
                    },
                },
            ],
        },
        {
            name: "Salary",
            budgetAmount: null,
            budgetPeriodType: "month",
            filters: [
                {
                    id: 2,
                    type: "text",
                    matchType: "regexp",
                    displayName: "Company",

                    matchPatterns: {
                        contraAccount: "Company Inc\\.",
                        description: "Salary for",
                    },
                },
                {
                    id: 3,
                    type: "manual",

                    transactionHash: 0x320923df,
                },
            ],
        },
    ],
};
const testPreferences = new Preferences();
const testStoredPreferences = {
    version: 0,
};

describe("StorageImpl", () => {
    test("should store settings to persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);

        storage.storeSettings(testSettings);

        expect(JSON.parse(storageDriver.loadHugeText("settings") ?? "null")).toEqual(
            testStoredSettings,
        );
    });

    test("should load settings from persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);
        storageDriver.storeHugeText("settings", JSON.stringify(testStoredSettings));

        const settings = storage.loadSettings();

        expect(settings).toEqual(testSettings);
    });

    test("should return null when no settings are available in persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);

        const settings = storage.loadSettings();

        expect(settings).toBeNull();
    });

    test("should store preferences to persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);

        storage.storePreferences(testPreferences);

        expect(JSON.parse(storageDriver.loadHugeText("preferences") ?? "null")).toEqual(
            testStoredPreferences,
        );
    });

    test("should load preferences from persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);
        storageDriver.storeHugeText("preferences", JSON.stringify(testStoredPreferences));

        const preferences = storage.loadPreferences();

        expect(preferences).toEqual(testPreferences);
    });

    test("should return null when no preferences are available in persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);

        const preferences = storage.loadPreferences();

        expect(preferences).toBeNull();
    });

    test("should store source data to persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);

        storage.storeSourceData("transactions1.csv", "test,transactions,data\n1,2,3");
        storage.storeSourceData("transactions2.csv", "transactions,data,test\n9,8,7");

        expect(storageDriver.loadHugeText("source-data/transactions1.csv")).toEqual(
            "0000test,transactions,data\n1,2,3",
        );
        expect(storageDriver.loadHugeText("source-data/transactions2.csv")).toEqual(
            "0000transactions,data,test\n9,8,7",
        );
    });

    test("should load source data from persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);
        storageDriver.storeHugeText(
            "source-data/transactions1.csv",
            "0000test,transactions,data\n1,2,3",
        );

        const sourceData = storage.loadSourceData("transactions1.csv");

        expect(sourceData.transactionData).toEqual("test,transactions,data\n1,2,3");
    });

    test("should signal an error when requested source data isn't available in persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);

        expect(() => storage.loadSourceData("transactions1.csv")).toThrow(
            'Could not load source data from persistent storage with name "transactions1.csv"',
        );
    });

    test("can remove source data from persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);
        storageDriver.storeHugeText(
            "source-data/transactions1.csv",
            "0000test,transactions,data\n1,2,3",
        );

        storage.removeSourceData("transactions1.csv");

        expect(storageDriver.loadHugeText("source-data/transactions1.csv")).toBeNull();
    });

    test("should list available source data entries from storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);
        storageDriver.storeHugeText(
            "source-data/transactions1.csv",
            "0000test,transactions,data\n1,2,3",
        );
        storageDriver.storeHugeText(
            "source-data/transactions2.csv",
            "0000transactions,data,test\n9,8,7",
        );

        const sourceDataNames = storage.listSourceDataNames();

        expect(sourceDataNames).toEqual(["transactions1.csv", "transactions2.csv"]);
    });

    test("should export sections to JSON", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);
        storageDriver.storeHugeText("test-section-1", "test-1");
        storageDriver.storeHugeText("test-section-2", '{"test-2":["foo","bar",0.5,null]}');

        const json = storage.exportJson();
        const jsonObject = JSON.parse(json);

        expect(jsonObject).toEqual({
            "test-section-1": "test-1",
            "test-section-2": '{"test-2":["foo","bar",0.5,null]}',
        });
    });

    test("should import sections from JSON", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);
        storageDriver.storeHugeText("test-section-1", "test-1");

        storage.importJson('{"test-section-2": "test-2", "test-section-3": "test-3"}');

        expect(storageDriver.listSections()).toEqual(["test-section-2", "test-section-3"]);

        expect(storageDriver.loadHugeText("test-section-2")).toEqual("test-2");
        expect(storageDriver.loadHugeText("test-section-3")).toEqual("test-3");
    });
});
