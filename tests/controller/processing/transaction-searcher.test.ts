import { Observable } from "@daign/observable";
import { createInjector } from "typed-inject";
import { TransactionSearcherImpl } from "../../../src/controller/processing/transaction-searcher";
import { TransactionAssigner } from "../../../src/controller/processing/transaction-assigner";
import {
    AssignedTransaction,
    Assignment,
    DECIMAL,
    SourceTransaction,
} from "../../../src/model/entities";
import { Period, PeriodType } from "../../../src/model/period";

const testTransactions = [
    new AssignedTransaction(
        new SourceTransaction(
            new Date("2022-02-23"),
            -25.5 * DECIMAL,
            "NL00MAIN1234567890",
            "NL57RABO0329443948",
            "M Sports Events",
            "Ticket 2022-293302",
        ),
        [new Assignment("Events", "Category", 0x06, "TextFilter")],
    ),
    new AssignedTransaction(
        new SourceTransaction(
            new Date("2021-11-16"),
            -200 * DECIMAL,
            "NL00SCND0987654321",
            "NL23ABNA9349042743",
            "Robot Computer Shop",
            "Invoice 934830293, laptop model VT94",
        ),
        [new Assignment("Tools", "Category", 0x01, "ManualFilter")],
    ),
    new AssignedTransaction(
        new SourceTransaction(
            new Date("2021-10-13"),
            -20 * DECIMAL,
            "NL00MAIN1234567890",
            "NL98INGB2152156592",
            "Mr. John",
            "Lunch",
        ),
        [
            new Assignment("Catering", "Category", 0x02, "ManualFilter"),
            new Assignment("Food", "Category", 0x03, "ManualFilter"),
        ],
    ),
    new AssignedTransaction(
        new SourceTransaction(
            new Date("2021-09-02"),
            -430 * DECIMAL,
            "NL00MAIN1234567890",
            "NL23ABNA0983409855",
            "Mike's Tire Repairs",
            "13th of November tire sale, 4x sports tires",
        ),
        [
            new Assignment("Tools", "Category", 0x04, "ManualFilter"),
            new Assignment("Tools", "Category", 0x05, "TextFilter"),
        ],
    ),
];

class TransactionAssignerMock
    extends Observable
    implements TransactionAssigner
{
    constructor(private transactions: AssignedTransaction[]) {
        super();
    }

    allTransactions(): AssignedTransaction[] {
        return this.transactions;
    }

    changeTransactions(newTransactions: AssignedTransaction[]) {
        this.transactions = newTransactions;
        this.notifyObservers();
    }
}

describe("TransactionSearcher", () => {
    const injector = createInjector();

    test("should search for category-specific transactions", () => {
        const transactionSearcher = injector
            .provideValue(
                "assigner",
                new TransactionAssignerMock(testTransactions),
            )
            .injectClass(TransactionSearcherImpl);

        const transactions = transactionSearcher.searchTransactions({
            categoryName: "Tools",
        });

        expect(transactions.length).toBe(2);
        expect(transactions[0].description).toEqual(
            "Invoice 934830293, laptop model VT94",
        );
        expect(transactions[1].description).toEqual(
            "13th of November tire sale, 4x sports tires",
        );

        const transactionsEmpty = transactionSearcher.searchTransactions({
            categoryName: "NonexistentCategory",
        });

        expect(transactionsEmpty.length).toBe(0);
    });

    test("should search for filter type-specific transactions", () => {
        const transactionSearcher = injector
            .provideValue(
                "assigner",
                new TransactionAssignerMock(testTransactions),
            )
            .injectClass(TransactionSearcherImpl);

        const transactionsManual = transactionSearcher.searchTransactions({
            filterType: "ManualFilter",
        });

        expect(transactionsManual.length).toBe(3);
        expect(transactionsManual[0].description).toEqual(
            "Invoice 934830293, laptop model VT94",
        );
        expect(transactionsManual[1].description).toEqual("Lunch");
        expect(transactionsManual[2].description).toEqual(
            "13th of November tire sale, 4x sports tires",
        );

        const transactionsAutomatic = transactionSearcher.searchTransactions({
            filterType: "TextFilter",
        });

        expect(transactionsAutomatic.length).toBe(2);
        expect(transactionsAutomatic[0].description).toEqual(
            "Ticket 2022-293302",
        );
        expect(transactionsAutomatic[1].description).toEqual(
            "13th of November tire sale, 4x sports tires",
        );
    });

    test("should search for filter-specific transactions", () => {
        const transactionSearcher = injector
            .provideValue(
                "assigner",
                new TransactionAssignerMock(testTransactions),
            )
            .injectClass(TransactionSearcherImpl);

        const transactionsFirst = transactionSearcher.searchTransactions({
            filterId: 0x02,
        });

        expect(transactionsFirst.length).toBe(1);
        expect(transactionsFirst[0].description).toEqual("Lunch");

        const transactionsSecond = transactionSearcher.searchTransactions({
            filterId: 0x04,
        });

        expect(transactionsSecond.length).toBe(1);
        expect(transactionsSecond[0].description).toEqual(
            "13th of November tire sale, 4x sports tires",
        );
    });

    test("should search for transactions within a specific period", () => {
        const transactionSearcher = injector
            .provideValue(
                "assigner",
                new TransactionAssignerMock(testTransactions),
            )
            .injectClass(TransactionSearcherImpl);

        const expectedSearchResults = [
            [
                new Period(PeriodType.Year, 2021, 1),
                [
                    "Invoice 934830293, laptop model VT94",
                    "Lunch",
                    "13th of November tire sale, 4x sports tires",
                ],
            ],
            [
                new Period(PeriodType.Quarter, 2021, 4),
                ["Invoice 934830293, laptop model VT94", "Lunch"],
            ],
            [
                new Period(PeriodType.Month, 2021, 11),
                ["Invoice 934830293, laptop model VT94"],
            ],
            [new Period(PeriodType.Week, 2022, 8), ["Ticket 2022-293302"]],
            [new Period(PeriodType.Day, 2021, 286), ["Lunch"]],
        ];

        const searchResults = expectedSearchResults.map((expectedResults) => {
            const transactions = transactionSearcher.searchTransactions({
                period: expectedResults[0] as Period,
            });
            const transactionDescriptions = transactions.map(
                (transaction) => transaction.description,
            );

            return [expectedResults[0] as Period, transactionDescriptions];
        });

        expect(searchResults).toEqual(expectedSearchResults);
    });

    test("should recalculate its results when the underlying data is changed", () => {
        const transactionAssigner = new TransactionAssignerMock(
            testTransactions,
        );
        const transactionSearcher = injector
            .provideValue("assigner", transactionAssigner)
            .injectClass(TransactionSearcherImpl);

        const searchResults = transactionSearcher.searchTransactions({
            categoryName: "Tools",
        });

        expect(searchResults.length).toBe(2);
        expect(searchResults[0].description).toEqual(
            "Invoice 934830293, laptop model VT94",
        );
        expect(searchResults[1].description).toEqual(
            "13th of November tire sale, 4x sports tires",
        );

        transactionAssigner.changeTransactions(testTransactions.slice(0, 2));

        const searchResultsChanged = transactionSearcher.searchTransactions({
            categoryName: "Tools",
        });

        expect(searchResultsChanged.length).toBe(1);
        expect(searchResultsChanged[0].description).toEqual(
            "Invoice 934830293, laptop model VT94",
        );
    });
});
