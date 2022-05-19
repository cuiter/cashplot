<template>
    <div class="full-size tab-contents">
        <progress-bar-component
            v-if="categoryTransactions.length !== 0"
            :percentage="budgetPercentageUsed"
        />
        <div
            v-if="categoryTransactions.length !== 0"
            class="budget-results flex-center"
        >
            <div class="budget-results-transactions">
                <span>{{ categoryTransactionsFiltered.length }}</span>
                <svg
                    class="budget-results-transactions-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                        d="M19.375 15.103A8.001 8.001 0 0 0 8.03 5.053l-.992-1.737A9.996 9.996 0 0 1 17 3.34c4.49 2.592 6.21 8.142 4.117 12.77l1.342.774-4.165 2.214-.165-4.714 1.246.719zM4.625 8.897a8.001 8.001 0 0 0 11.345 10.05l.992 1.737A9.996 9.996 0 0 1 7 20.66C2.51 18.068.79 12.518 2.883 7.89L1.54 7.117l4.165-2.214.165 4.714-1.246-.719zm8.79 5.931L10.584 12l-2.828 2.828-1.414-1.414 4.243-4.242L13.414 12l2.829-2.828 1.414 1.414-4.243 4.242z"
                    />
                </svg>
            </div>
            <div class="budget-results-used">
                <span
                    :class="{
                        'text-right': true,
                        'color-positive':
                            budgetUsed.type === 'income'
                                ? budgetPercentageUsed >= 100
                                : budgetPercentageUsed <= 100,
                        'color-negative':
                            budgetUsed.type === 'income'
                                ? false
                                : budgetPercentageUsed > 100,
                    }"
                >
                    €{{ Math.abs(budgetUsed.amount / DECIMAL).toFixed(0) }}
                </span>
                /
                <span>{{ Math.abs(budgetAllowed / DECIMAL).toFixed(0) }}</span>
            </div>
            <span class="budget-results-used-comment">
                {{ budgetUsed.type === "income" ? "Ontvangen" : "Uitgegeven" }}
                <span class="budget-results-period-comment">deze periode</span>
            </span>
        </div>

        <period-selection-component
            v-if="categoryTransactions.length !== 0"
            v-model="filterPeriod"
            :range-start-date="categoryTransactions[0].date"
            :range-end-date="
                categoryTransactions[categoryTransactions.length - 1].date
            "
        />
        <transaction-list-component
            :transactions="categoryTransactionsFiltered"
        />
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Period, PeriodsPerYear, PeriodType } from "../../model/period";
import { DECIMAL } from "../../model/entities";

const nonExistentCategoryName =
    "non-existent-category-" + new Date().getTime().toString();
const nonExistentPeriod = new Period(PeriodType.Year, 9999);

export default Vue.extend({
    data: function () {
        return {
            filterPeriod: null,
        };
    },
    computed: {
        DECIMAL: () => DECIMAL,
        categorySearchQuery: function () {
            const categoryName = ((this as any).openedWindowEntry ?? {})
                .categoryName;

            // Should not yield any results if categoryName is not set.
            return {
                categoryName: categoryName
                    ? categoryName
                    : nonExistentCategoryName,
            };
        },
        categoryFilteredSearchQuery: function () {
            return Object.assign(
                {
                    period:
                        this.$data.filterPeriod !== null
                            ? this.$data.filterPeriod
                            : nonExistentPeriod,
                },
                (this as any).categorySearchQuery,
            );
        },
        categoryTransactions: function () {
            return this.$root.$data.searcher.searchTransactions(
                (this as any).categorySearchQuery,
            );
        },
        categoryTransactionsFiltered: function () {
            return this.$root.$data.searcher.searchTransactions(
                (this as any).categoryFilteredSearchQuery,
            );
        },
        budgetUsed: function (): { amount: number; type: string } {
            const categoryName = ((this as any).openedWindowEntry ?? {})
                .categoryName;

            if (categoryName) {
                const cashFlow: { income: number; expenses: number } =
                    this.$root.$data.cashFlow.calculateCashFlow(
                        (this as any).categoryFilteredSearchQuery,
                    );

                const netCashFlow = cashFlow.income - cashFlow.expenses;

                if (netCashFlow <= 0) {
                    return {
                        amount: -netCashFlow,
                        type: "expenses",
                    };
                } else {
                    return {
                        amount: netCashFlow,
                        type: "income",
                    };
                }
            } else {
                return {
                    amount: 0,
                    type: "expenses",
                };
            }
        },
        budgetAllowed: function () {
            const categoryName = ((this as any).openedWindowEntry ?? {})
                .categoryName;

            if (categoryName && this.$data.filterPeriod !== null) {
                const budget =
                    this.$root.$data.categories.getBudget(categoryName);

                if (budget === null) return 0;

                return (
                    (budget.amount *
                        PeriodsPerYear[budget.periodType as PeriodType]) /
                    PeriodsPerYear[this.$data.filterPeriod.type as PeriodType]
                );
            } else {
                return 0;
            }
        },
        budgetPercentageUsed: function () {
            const budgetAllowed: number = this.budgetAllowed as number;
            const budgetUsed: number = (this.budgetUsed as any)
                .amount as number;
            const budgetType: string = (this.budgetUsed as any).type as string;
            if (budgetAllowed !== 0) {
                let percentageUsed = (budgetUsed / budgetAllowed) * 100;

                if (percentageUsed > 100 && budgetType === "income") {
                    percentageUsed = 100;
                }

                return percentageUsed;
            } else {
                return 0;
            }
        },
    },
    watch: {
        filterPeriod: function () {
            const categoryName = ((this as any).openedWindowEntry ?? {})
                .categoryName;

            if (categoryName) {
                (this as any).changeWindowEntry({
                    categoryName: categoryName,
                    filterPeriod: this.$data.filterPeriod,
                });
            }
        },
    },
    created: function () {
        // If the current category does not exist anymore,
        // open the first category that does exist.
        const categoryName = ((this as any).openedWindowEntry ?? {})
            .categoryName;
        const existingCategories: string[] = (
            this as any
        ).$root.$data.categories.list();

        if (existingCategories.indexOf(categoryName) === -1) {
            (this as any).closeWindow();
            return;
        }

        this.$data.filterPeriod =
            ((this as any).openedWindowEntry ?? {}).filterPeriod ?? null;
    },
});
</script>
