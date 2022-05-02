import { StorageDriver } from "../src/interfaces";
import { StorageImpl } from "../src/model/storage";
import {
    Account,
    Category,
    DECIMAL,
    ManualFilter,
    Preferences,
    Settings,
    WildcardFilter,
} from "../src/model/entities";

class StorageDriverMock implements StorageDriver {
    private valueStore: any = {};

    constructor() {}

    loadObject(section: string): object | null {
        return Object.prototype.hasOwnProperty.call(this.valueStore, section)
            ? this.valueStore[section]
            : null;
    }
    storeObject(section: string, object: object): void {
        this.valueStore[section] = object;
    }
    loadHugeText(section: string): string | null {
        return Object.prototype.hasOwnProperty.call(this.valueStore, section)
            ? this.valueStore[section]
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
        new Category("Shopping", 300 * DECIMAL, [
            new WildcardFilter(1, "bol.com", "90340932902"),
        ]),
        new Category("Salary", null, [
            new WildcardFilter(2, "Company Inc.", "Salary for"),
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
            monthlyBudget: 300 * DECIMAL,
            filters: [
                {
                    type: "wildcard",
                    id: 1,
                    contraAccount: "bol.com",
                    description: "90340932902",
                },
            ],
        },
        {
            name: "Salary",
            monthlyBudget: null,
            filters: [
                {
                    type: "wildcard",
                    id: 2,
                    contraAccount: "Company Inc.",
                    description: "Salary for",
                },
                {
                    type: "manual",
                    id: 3,
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

        expect(storageDriver.loadObject("settings")).toEqual(
            testStoredSettings,
        );
    });

    test("should load settings from persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);
        storageDriver.storeObject("settings", testStoredSettings);

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

        expect(storageDriver.loadObject("preferences")).toEqual(
            testStoredPreferences,
        );
    });

    test("should load preferences from persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);
        storageDriver.storeObject("preferences", testStoredPreferences);

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

        storage.storeSourceData(
            "transactions1.csv",
            "test,transactions,data\n1,2,3",
        );
        storage.storeSourceData(
            "transactions2.csv",
            "transactions,data,test\n9,8,7",
        );

        expect(
            storageDriver.loadHugeText("source-data/transactions1.csv"),
        ).toEqual("0000test,transactions,data\n1,2,3");
        expect(
            storageDriver.loadHugeText("source-data/transactions2.csv"),
        ).toEqual("0000transactions,data,test\n9,8,7");
    });

    test("should load source data from persistent storage", () => {
        const storageDriver = new StorageDriverMock();
        const storage = new StorageImpl(storageDriver);
        storageDriver.storeHugeText(
            "source-data/transactions1.csv",
            "0000test,transactions,data\n1,2,3",
        );

        const sourceData = storage.loadSourceData("transactions1.csv");

        expect(sourceData.transactionData).toEqual(
            "test,transactions,data\n1,2,3",
        );
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

        expect(
            storageDriver.loadHugeText("source-data/transactions1.csv"),
        ).toBeNull();
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

        expect(sourceDataNames).toEqual([
            "transactions1.csv",
            "transactions2.csv",
        ]);
    });
});
