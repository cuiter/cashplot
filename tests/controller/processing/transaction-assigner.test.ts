import { Observable } from "@daign/observable";
import { createInjector } from "typed-inject";
import { TransactionAssignerImpl } from "../../../src/controller/processing/transaction-assigner";
import { CategoryCollection } from "../../../src/controller/collections/category-collection";
import { SourceDataCollection } from "../../../src/controller/collections/source-data-collection";
import {
    Assignment,
    Category,
    DECIMAL,
    Filter,
    ManualFilter,
    PeriodType,
    SourceDataInfo,
    SourceTransaction,
    TextFilter,
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
        "NL23ABNA0983409855",
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

        for (const category of this.categories) {
            for (const filter of category.filters) {
                filter.init();
            }
        }
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
    setBudget(
        _name: string,
        _budgetAmount: number,
        _budgetPeriodType: PeriodType,
    ): void {
        throw new Error("Method not implemented.");
    }
    getBudget(_name: string): {
        amount: number | null;
        periodType: PeriodType;
    } {
        throw new Error("Method not implemented.");
    }
    addFilters(_categoryName: string, _filter: Filter[]): void {
        throw new Error("Method not implemented.");
    }
    removeFilters(_categoryName: string, _filterId: number[]): void {
        throw new Error("Method not implemented.");
    }
    getFilters(_name: string): Filter[] {
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
            new Category("Catering", 200 * DECIMAL, PeriodType.Month, [
                new ManualFilter(0x01, 0x1002),
            ]),
            new Category("Tools", 400 * DECIMAL, PeriodType.Month, [
                new ManualFilter(0x02, 0x1001),
                new ManualFilter(0x03, 0x1003),
            ]),
            new Category("Food", 400 * DECIMAL, PeriodType.Month, [
                new ManualFilter(0x04, 0x1002),
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
            new Assignment("Tools", "Category", 0x02, "ManualFilter"),
        ]);
        expect(transactions[1].assignments).toEqual([
            new Assignment("Catering", "Category", 0x01, "ManualFilter"),
            new Assignment("Food", "Category", 0x04, "ManualFilter"),
        ]);
        expect(transactions[2].assignments).toEqual([
            new Assignment("Tools", "Category", 0x03, "ManualFilter"),
        ]);
    });

    test("should assign categories based on text match filters", () => {
        const categories: Category[] = [
            new Category("Catering", 200 * DECIMAL, PeriodType.Month, [
                new TextFilter(0x01, "", "wildcard", {
                    contraAccount: "Mr. John",
                    description: "Lunch",
                }),
            ]),
            new Category("Tools", 400 * DECIMAL, PeriodType.Month, [
                new TextFilter(0x02, "", "wildcard", {
                    contraAccount: "NL23ABNA9349042743",
                    description: "Invoice *, laptop model *",
                }),
                new TextFilter(0x03, "", "regexp", {
                    contraAccount: "^(Robot Computer Shop|NL23ABNA0983409855)$",
                    description: ".*",
                }),
                new TextFilter(0x11, "", "regexp", {
                    contraAccount: "^(non-existent-name|NL23ABNA0983409855)$",
                    description: ".*",
                }),
                new TextFilter(0x12, "", "regexp", {
                    contraAccount:
                        "^(Robot Computer Shop|non-existent-number)$",
                    description: ".*",
                }),
            ]),
            new Category("Food", 400 * DECIMAL, PeriodType.Month, [
                new TextFilter(0x04, "", "wildcard", {
                    contraAccount: "Mr. John",
                    description: "Lunch",
                }),
                new TextFilter(0x13, "", "regexp", {
                    contraAccount: "Non-matching contra name",
                    description: "",
                }),
                new TextFilter(0x14, "", "wildcard", {
                    contraAccount: "",
                    description: "Non-matching description",
                }),
                new TextFilter(0x15, "", "wildcard", {
                    contraAccount: "", // Does not match anything since all fields are empty
                    description: "",
                }),
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
            new Assignment("Tools", "Category", 0x02, "TextFilter"),
            new Assignment("Tools", "Category", 0x03, "TextFilter"),
            new Assignment("Tools", "Category", 0x12, "TextFilter"),
        ]);
        expect(transactions[1].assignments).toEqual([
            new Assignment("Catering", "Category", 0x01, "TextFilter"),
            new Assignment("Food", "Category", 0x04, "TextFilter"),
        ]);
        expect(transactions[2].assignments).toEqual([
            new Assignment("Tools", "Category", 0x03, "TextFilter"),
            new Assignment("Tools", "Category", 0x11, "TextFilter"),
        ]);
    });
});
