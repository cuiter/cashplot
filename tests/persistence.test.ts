import { createInjector } from "typed-inject";
import { PersistenceDriver } from "../src/interfaces";
import { PersistenceImpl } from "../src/persistence";
import {
    Account,
    Category,
    DECIMAL,
    Preferences,
    Settings,
    WildcardFilter,
} from "../src/types";

class PersistenceDriverMock implements PersistenceDriver {
    private valueStore: any = {};

    constructor() {}

    loadObject(section: string): object | null {
        return this.valueStore.hasOwnProperty(section)
            ? this.valueStore[section]
            : null;
    }
    storeObject(section: string, object: object): void {
        this.valueStore[section] = object;
    }
    loadHugeText(section: string): string | null {
        return this.valueStore.hasOwnProperty(section)
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
            new WildcardFilter("bol.com", "90340932902"),
        ]),
        new Category("Salary", null, [
            new WildcardFilter("Company Inc.", "Salary for"),
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
                    contraAccount: "Company Inc.",
                    description: "Salary for",
                },
            ],
        },
    ],
};
const testPreferences = new Preferences({
    developerMode: true,
    currentView: "home",
    currentTab: null,
});
const testStoredPreferences = {
    version: 0,
    developerMode: true,
    currentView: "home",
    currentTab: null,
};

describe("PersistenceImpl", () => {
    test("should store settings to persistent storage", () => {
        const persistenceDriver = new PersistenceDriverMock();
        const persistence = new PersistenceImpl(persistenceDriver);

        persistence.storeSettings(testSettings);

        expect(persistenceDriver.loadObject("settings")).toEqual(
            testStoredSettings,
        );
    });

    test("should load settings from persistent storage", () => {
        const persistenceDriver = new PersistenceDriverMock();
        const persistence = new PersistenceImpl(persistenceDriver);
        persistenceDriver.storeObject("settings", testStoredSettings);

        const settings = persistence.loadSettings();

        expect(settings).toEqual(testSettings);
    });

    test("should store preferences to persistent storage", () => {
        const persistenceDriver = new PersistenceDriverMock();
        const persistence = new PersistenceImpl(persistenceDriver);

        persistence.storePreferences(testPreferences);

        expect(persistenceDriver.loadObject("preferences")).toEqual(
            testStoredPreferences,
        );
    });

    test("should load preferences from persistent storage", () => {
        const persistenceDriver = new PersistenceDriverMock();
        const persistence = new PersistenceImpl(persistenceDriver);
        persistenceDriver.storeObject("preferences", testStoredPreferences);

        const preferences = persistence.loadPreferences();

        expect(preferences).toEqual(testPreferences);
    });

    test("should store source data to persistent storage", () => {
        const persistenceDriver = new PersistenceDriverMock();
        const persistence = new PersistenceImpl(persistenceDriver);

        persistence.storeSourceData(
            "transactions1.csv",
            "test,transactions,data\n1,2,3",
        );
        persistence.storeSourceData(
            "transactions2.csv",
            "transactions,data,test\n9,8,7",
        );

        expect(
            persistenceDriver.loadHugeText("source-data/transactions1.csv"),
        ).toEqual("0000test,transactions,data\n1,2,3");
        expect(
            persistenceDriver.loadHugeText("source-data/transactions2.csv"),
        ).toEqual("0000transactions,data,test\n9,8,7");
    });

    test("should load source data from persistent storage", () => {
        const persistenceDriver = new PersistenceDriverMock();
        const persistence = new PersistenceImpl(persistenceDriver);
        persistenceDriver.storeHugeText(
            "source-data/transactions1.csv",
            "0000test,transactions,data\n1,2,3",
        );

        const sourceData = persistence.loadSourceData("transactions1.csv");

        expect(sourceData.transactionData).toEqual(
            "test,transactions,data\n1,2,3",
        );
    });

    test("can remove source data from persistent storage", () => {
        const persistenceDriver = new PersistenceDriverMock();
        const persistence = new PersistenceImpl(persistenceDriver);
        persistenceDriver.storeHugeText(
            "source-data/transactions1.csv",
            "0000test,transactions,data\n1,2,3",
        );

        persistence.removeSourceData("transactions1.csv");

        expect(
            persistenceDriver.loadHugeText("source-data/transactions1.csv"),
        ).toBeNull();
    });

    test("should list available source data entries from storage", () => {
        const persistenceDriver = new PersistenceDriverMock();
        const persistence = new PersistenceImpl(persistenceDriver);
        persistenceDriver.storeHugeText(
            "source-data/transactions1.csv",
            "0000test,transactions,data\n1,2,3",
        );
        persistenceDriver.storeHugeText(
            "source-data/transactions2.csv",
            "0000transactions,data,test\n9,8,7",
        );

        const sourceDataNames = persistence.listSourceDataNames();

        expect(sourceDataNames).toEqual([
            "transactions1.csv",
            "transactions2.csv",
        ]);
    });
});
