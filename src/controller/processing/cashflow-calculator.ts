import { Observable } from "@daign/observable";
import { CashFlowCalculator, TransactionSearcher } from "../../interfaces";
import { SearchQuery } from "../../model/entities";

export class CashFlowCalculatorImpl
    extends Observable
    implements CashFlowCalculator
{
    public static inject = ["searcher"] as const;

    constructor(public searcher: TransactionSearcher) {
        super();
    }

    calculateCashFlow(searchQuery: SearchQuery): {
        income: number;
        expenses: number;
    } {
        const transactions = this.searcher.searchTransactions(searchQuery);

        let totalIncome = 0;
        let totalExpenses = 0;

        for (const transaction of transactions) {
            if (transaction.amount > 0) {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += -transaction.amount;
            }
        }

        return { income: totalIncome, expenses: totalExpenses };
    }
}
