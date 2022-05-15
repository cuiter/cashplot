import { Observable } from "@daign/observable";
import { createInjector } from "typed-inject";
import { TransactionSearcherImpl } from "../../../src/controller/processing/transaction-searcher";
import { TransactionAssigner } from "../../../src/interfaces";
import {
    AssignedTransaction,
    Assignment,
    DECIMAL,
    SearchQuery,
    SourceTransaction,
} from "../../../src/model/entities";

const testTransactions = [
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
            new Date("2021-11-13"),
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
            new Date("2021-11-02"),
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

        expect(transactionsAutomatic.length).toBe(1);
        expect(transactionsAutomatic[0].description).toEqual(
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
});
