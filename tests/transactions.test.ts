import { createInjector } from "typed-inject";
import { TransactionsImpl } from "../src/controller/transactions";
import { DECIMAL, SourceTransaction } from "../src/model/entities";

describe("TransactionsImpl", () => {
    test("should combine multiple lists of source transactions into one", () => {
        const sourceTransactions = [
            [
                new SourceTransaction(
                    new Date("2021-11-02"),
                    -20 * DECIMAL,
                    "NL00MAIN1234567890",
                    "NL98INGB2152156592",
                    "Mr. John",
                    "Lunch",
                ),
                new SourceTransaction(
                    new Date("2021-11-16"),
                    -200 * DECIMAL,
                    "NL00MAIN1234567890",
                    "NL23ABNA9349042743",
                    "Robot Computer Shop",
                    "Invoice 934830293, laptop model VT94",
                ),
            ],
            [
                new SourceTransaction(
                    new Date("2021-11-02"),
                    -20 * DECIMAL,
                    "NL00MAIN1234567890",
                    "NL98INGB2152156592",
                    "Mr. John",
                    "Lunch",
                ),
            ],
            [
                new SourceTransaction(
                    new Date("2021-11-13"),
                    -430 * DECIMAL,
                    "NL98INGB2152156592",
                    "NL23ABNA9349042743",
                    "Mike's Tire Repairs",
                    "13th of November tire sale, 4x sports tires",
                ),
                new SourceTransaction(
                    new Date("2021-11-02"),
                    20 * DECIMAL,
                    "NL98INGB2152156592",
                    "NL00MAIN1234567890",
                    "Mr. G",
                    "Lunch",
                ),
            ],
        ];
        var transactionsImpl = new TransactionsImpl();

        var transactions = transactionsImpl.combineSources(sourceTransactions);

        expect(transactions.length).toBe(3);
        expect(transactions[0].date).toEqual(new Date("2021-11-02"));
        expect(transactions[0].amount).toBe(-20 * DECIMAL);
        expect(transactions[0].account).toBe("NL00MAIN1234567890");
        expect(transactions[0].contraAccount).toBe("NL98INGB2152156592");
        expect(transactions[0].contraAccountName).toBe("Mr. John");
        expect(transactions[0].description).toBe("Lunch");

        expect(transactions[1].date).toEqual(new Date("2021-11-13"));
        expect(transactions[1].amount).toBe(-430 * DECIMAL);
        expect(transactions[1].account).toBe("NL98INGB2152156592");
        expect(transactions[1].contraAccount).toBe("NL23ABNA9349042743");
        expect(transactions[1].contraAccountName).toBe("Mike's Tire Repairs");
        expect(transactions[1].description).toBe(
            "13th of November tire sale, 4x sports tires",
        );

        expect(transactions[2].date).toEqual(new Date("2021-11-16"));
        expect(transactions[2].amount).toBe(-200 * DECIMAL);
        expect(transactions[2].account).toBe("NL00MAIN1234567890");
        expect(transactions[2].contraAccount).toBe("NL23ABNA9349042743");
        expect(transactions[2].contraAccountName).toBe("Robot Computer Shop");
        expect(transactions[2].description).toBe(
            "Invoice 934830293, laptop model VT94",
        );
    });
});
