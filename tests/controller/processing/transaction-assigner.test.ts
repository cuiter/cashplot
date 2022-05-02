import { TransactionAssignerImpl } from "../../../src/controller/processing/transaction-assigner";
import {
    Account,
    Category,
    DECIMAL,
    ManualFilter,
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

describe("TransactionAssigner", () => {
    test("should assign categories based on manual filters", () => {
        const accounts: Account[] = [];
        const categories: Category[] = [
            new Category("Catering", 200 * DECIMAL, [
                new ManualFilter(1, 0x1002),
            ]),
            new Category("Electronics", 400 * DECIMAL, [
                new ManualFilter(1, 0x1001),
            ]),
            new Category("Food", 400 * DECIMAL, [new ManualFilter(1, 0x1002)]),
        ];

        const transactions = new TransactionAssignerImpl().assignTransactions(
            testTransactions,
            accounts,
            categories,
        );

        expect(transactions.length).toBe(3);
        expect(transactions[0].assignedCategories).toEqual([categories[1]]);
        expect(transactions[1].assignedCategories).toEqual([
            categories[0],
            categories[2],
        ]);
        expect(transactions[2].assignedCategories).toEqual([]);
    });
});
