<template>
    <div class="full-size tab-contents">
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
import { SearchQuery } from "../../model/entities";
import { Period, PeriodType } from "../../model/period";

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
        categoryTransactions: function () {
            const categoryName = ((this as any).openedWindowEntry ?? {})
                .categoryName;

            if (categoryName) {
                return this.$root.$data.searcher.searchTransactions({
                    categoryName: categoryName,
                } as SearchQuery);
            } else {
                return [];
            }
        },
        categoryTransactionsFiltered: function () {
            const categoryName = ((this as any).openedWindowEntry ?? {})
                .categoryName;

            if (categoryName) {
                return this.$root.$data.searcher.searchTransactions({
                    categoryName: categoryName,
                    period: this.$data.filterPeriod,
                } as SearchQuery);
            } else {
                return [];
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
