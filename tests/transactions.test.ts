import { createInjector } from "typed-inject";
import { StateImpl } from "../src/state";
import { TransactionsImpl } from "../src/transactions";
import { DECIMAL, SourceTransaction } from "../src/types";

describe("TransactionsImpl", () => {
    const injector = createInjector().provideClass("state", StateImpl);

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
                    200 * DECIMAL,
                    "NL00MAIN1234567890",
                    "NL23ABNA9349042743",
                    "Robot Computer Shop",
                    "Invoice 934830293, laptop model VT94",
                ),
            ],
            [
                new SourceTransaction(
                    new Date("2021-11-13"),
                    430 * DECIMAL,
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
    });
});
