import { Observable } from "@daign/observable";
import { createInjector } from "typed-inject";
import { TransactionSearcher } from "../../../src/controller/processing/transaction-searcher";
import { CashFlowCalculatorImpl } from "../../../src/controller/processing/cashflow-calculator";
import {
    AssignedTransaction,
    Assignment,
    DECIMAL,
    SearchQuery,
    SourceTransaction,
} from "../../../src/model/entities";
import { Period, PeriodType } from "../../../src/model/period";

const testTransactions = [
    new AssignedTransaction(
        new SourceTransaction(
            new Date("2021-11-13"),
            -20 * DECIMAL,
            "NL00MAIN1234567890",
            "NL98INGB2152156592",
            "Mr. John",
            "Lunch",
        ),
        [new Assignment("Catering", "Category", 0x01, "TextFilter")],
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
        [new Assignment("Tools", "Category", 0x02, "ManualFilter")],
    ),
    new AssignedTransaction(
        new SourceTransaction(
            new Date("2020-06-28"),
            4000 * DECIMAL,
            "NL00MAIN1234567890",
            "NL01WORK0987654321",
            "Company Inc.",
            "Salary for June 2020",
        ),
        [new Assignment("Salary", "Category", 0x03, "TextFilter")],
    ),
];

class TransactionSearcherMock
    extends Observable
    implements TransactionSearcher
{
    // Limited version of searchTransactions, used for testing whether search queries are passed correctly.
    searchTransactions(searchQuery: SearchQuery): AssignedTransaction[] {
        let assignedTransactions = testTransactions;

        if (searchQuery.period?.year === 2021) {
            assignedTransactions = [
                assignedTransactions[0],
                assignedTransactions[1],
            ];
        } else if (searchQuery.period?.year === 2020) {
            assignedTransactions = [assignedTransactions[2]];
        }

        if (searchQuery.categoryName) {
            assignedTransactions = assignedTransactions.filter((transaction) =>
                transaction.assignments.some(
                    (assignment) =>
                        assignment.name === searchQuery.categoryName,
                ),
            );
        }

        return assignedTransactions;
    }
}

describe("CashFlowCalculator", () => {
    const injector = createInjector();

    test("should calculate total income and expenses within a specific time period", () => {
        const cashflowCalculator = injector
            .provideClass("searcher", TransactionSearcherMock)
            .injectClass(CashFlowCalculatorImpl);

        const resultFirstYear = cashflowCalculator.calculateCashFlow({
            period: new Period(PeriodType.Year, 2020),
        });
        const resultSecondYear = cashflowCalculator.calculateCashFlow({
            period: new Period(PeriodType.Year, 2021),
        });

        expect(resultFirstYear.income).toEqual(4000 * DECIMAL);
        expect(resultFirstYear.expenses).toEqual(0 * DECIMAL);
        expect(resultSecondYear.income).toEqual(0 * DECIMAL);
        expect(resultSecondYear.expenses).toEqual(450 * DECIMAL);
    });

    test("should calculate total income and expenses for a specific category", () => {
        const cashflowCalculator = injector
            .provideClass("searcher", TransactionSearcherMock)
            .injectClass(CashFlowCalculatorImpl);

        const resultTools = cashflowCalculator.calculateCashFlow({
            categoryName: "Tools",
        });
        const resultSalary = cashflowCalculator.calculateCashFlow({
            categoryName: "Salary",
        });

        expect(resultTools.income).toEqual(0 * DECIMAL);
        expect(resultTools.expenses).toEqual(430 * DECIMAL);
        expect(resultSalary.income).toEqual(4000 * DECIMAL);
        expect(resultSalary.expenses).toEqual(0 * DECIMAL);
    });
});
