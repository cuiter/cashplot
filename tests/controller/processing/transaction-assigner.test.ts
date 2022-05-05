import { Observable } from "@daign/observable";
import { createInjector } from "typed-inject";
import { TransactionAssignerImpl } from "../../../src/controller/processing/transaction-assigner";
import {
    CategoryCollection,
    SourceDataCollection,
} from "../../../src/interfaces";
import {
    Account,
    Assignment,
    Category,
    DECIMAL,
    Filter,
    ManualFilter,
    SourceDataInfo,
    SourceTransaction,
} from "../../../src/model/entities";

const testTransactions = [
    new SourceTransaction(
        new Date("2021-11-16"),
        -200 * DECIMAL,
        "NL00SCND0987654321",
        "NL23ABNA9349042743",
        "Robot Computer Shop",
        "Invoice 934830293, laptop model VT94",
    ).overrideHash(0x1001),
    new SourceTransaction(
        new Date("2021-11-13"),
        -20 * DECIMAL,
        "NL00MAIN1234567890",
        "NL98INGB2152156592",
        "Mr. John",
        "Lunch",
    ).overrideHash(0x1002),
    new SourceTransaction(
        new Date("2021-11-02"),
        -430 * DECIMAL,
        "NL00MAIN1234567890",
        "NL23ABNA9349042743",
        "Mike's Tire Repairs",
        "13th of November tire sale, 4x sports tires",
    ).overrideHash(0x1003),
];

class SourceDataCollectionMock
    extends Observable
    implements SourceDataCollection
{
    constructor(private transactions: SourceTransaction[]) {
        super();
    }
    init(): void {
        this.notifyObservers();
    }
    add(_name: string, _transactionsData: string): void {
        throw new Error("Method not implemented.");
    }
    remove(_name: string): void {
        throw new Error("Method not implemented.");
    }
    allInfo(): SourceDataInfo {
        throw new Error("Method not implemented.");
    }
    allTransactions(): SourceTransaction[] {
        return this.transactions;
    }
}

class CategoryCollectionMock extends Observable implements CategoryCollection {
    constructor(private categories: Category[]) {
        super();
    }
    init(): void {
        this.notifyObservers();
    }
    add(_defaultName: string): string {
        throw new Error("Method not implemented.");
    }
    remove(_name: string): void {
        throw new Error("Method not implemented.");
    }
    rename(_name: string, _newName: string): boolean {
        throw new Error("Method not implemented.");
    }
    addFilters(_categoryName: string, _filter: Filter[]): void {
        throw new Error("Method not implemented.");
    }
    removeFilters(_categoryName: string, _filterId: number[]): void {
        throw new Error("Method not implemented.");
    }
    get(_name: string): Category {
        throw new Error("Method not implemented.");
    }
    list(): string[] {
        throw new Error("Method not implemented.");
    }
    all(): Category[] {
        return this.categories;
    }
}

describe("TransactionAssigner", () => {
    const injector = createInjector();

    test("should assign categories based on manual filters", () => {
        const categories: Category[] = [
            new Category("Catering", 200 * DECIMAL, [
                new ManualFilter(0x01, 0x1002),
            ]),
            new Category("Electronics", 400 * DECIMAL, [
                new ManualFilter(0x02, 0x1001),
            ]),
            new Category("Food", 400 * DECIMAL, [
                new ManualFilter(0x03, 0x1002),
            ]),
        ];
        const sourceDataCollection = new SourceDataCollectionMock(
            testTransactions,
        );
        const categoryCollection = new CategoryCollectionMock(categories);
        const transactionAssigner = injector
            .provideValue("sourceData", sourceDataCollection)
            .provideValue("categories", categoryCollection)
            .injectClass(TransactionAssignerImpl);

        sourceDataCollection.init();
        categoryCollection.init();
        const transactions = transactionAssigner.allTransactions();

        expect(transactions.length).toBe(3);
        expect(transactions[0].assignments).toEqual([
            new Assignment("Electronics", "Category", 0x02, "ManualFilter"),
        ]);
        expect(transactions[1].assignments).toEqual([
            new Assignment("Catering", "Category", 0x01, "ManualFilter"),
            new Assignment("Food", "Category", 0x03, "ManualFilter"),
        ]);
        expect(transactions[2].assignments).toEqual([]);
    });
});
