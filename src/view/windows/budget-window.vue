<template>
    <div class="full-size tab-contents">
        <progress-bar-component :percentage="budgetPercentageUsed" />
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

const nonExistentCategoryName =
    "non-existent-category-" + new Date().getTime().toString();

export default Vue.extend({
    data: function () {
        return {
            filterPeriod: new Period(
                PeriodType.Year,
                new Date().getFullYear(),
            ) as Period,
        };
    },
    computed: {
        categorySearchQuery: function () {
            const categoryName = ((this as any).openedWindowEntry ?? {})
                .categoryName;

            if (categoryName) {
                return { categoryName: categoryName };
            } else {
                // Should not yield any results.
                return { categoryName: nonExistentCategoryName };
            }
        },
        categoryFilteredSearchQuery: function () {
            return Object.assign(
                { period: this.$data.filterPeriod },
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
        budgetPercentageUsed: function () {
            const categoryName = ((this as any).openedWindowEntry ?? {})
                .categoryName;

            if (categoryName) {
                const cashFlow: { income: number; expenses: number } =
                    this.$root.$data.cashFlow.calculateCashFlow(
                        (this as any).categoryFilteredSearchQuery,
                    );
                const biggestFactor =
                    cashFlow.expenses > cashFlow.income
                        ? cashFlow.expenses
                        : cashFlow.income;

                const budget =
                    this.$root.$data.categories.getBudget(categoryName);

                const usedFactor =
                    ((biggestFactor / budget.amount) *
                        PeriodsPerYear[
                            (this as any).filterPeriod.type as PeriodType
                        ]) /
                    PeriodsPerYear[budget.periodType as PeriodType];

                return usedFactor * 100;
            } else {
                return 0;
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
        }
    },
});
</script>
