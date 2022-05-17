<template>
    <div class="full-size view-width flex-space-between">
        <option-selection-component
            v-model="categoryName"
            class="top-nav-button selected border-none"
            :options="categoryNames"
        />

        <div class="budget-entry">
            <input
                v-model="newBudgetAmount"
                placeholder="-"
                type="number"
                min="0"
                class="text-center"
                @blur="updateBudgetAmount"
            />
            <span>Budget (€/mnd)</span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { DECIMAL, PeriodType } from "../../model/entities";
export default Vue.extend({
    data: function () {
        return {
            categoryName: "",
            newBudgetAmount: null as null | number,
        };
    },
    computed: {
        categoryNames: function () {
            return this.$root.$data.categories.list();
        },
    },
    watch: {
        categoryName: function () {
            const newCategoryName = this.categoryName;

            if (
                (this as any).openedWindow === "budget" &&
                (this as any).openedWindowEntry.categoryName !== newCategoryName
            ) {
                const filterPeriod = (this as any).openedWindowEntry
                    .filterPeriod;
                (this as any).closeWindow();
                (this as any).openWindow("budget", {
                    categoryName: newCategoryName,
                    filterPeriod: filterPeriod, // Keep current filter period
                });

                this.loadCategoryData();
            }
        },
    },
    created: function () {
        this.loadCategoryData();
    },
    methods: {
        loadCategoryData: function () {
            const categoryName =
                ((this as any).openedWindowEntry ?? {}).categoryName ?? null;

            if (categoryName !== null) {
                this.categoryName = categoryName;

                const newBudgetAmount = (this.newBudgetAmount =
                    this.$root.$data.categories.getBudget(categoryName).amount);

                if (newBudgetAmount === null) {
                    // Empty out the budget user input.
                    this.newBudgetAmount = null;
                } else {
                    this.newBudgetAmount = newBudgetAmount / DECIMAL;
                }
            }
        },
        updateBudgetAmount: function () {
            const newBudgetAmount = this.newBudgetAmount;
            const categoryName = (this as any).openedWindowEntry.categoryName;

            // If new budget is not 0, empty string, etc.
            if (newBudgetAmount) {
                this.$root.$data.categories.setBudget(
                    categoryName,
                    newBudgetAmount * DECIMAL,
                    PeriodType.Month,
                );
            } else {
                this.$root.$data.categories.setBudget(
                    categoryName,
                    null,
                    PeriodType.Month,
                );
            }
        },
    },
});
</script>
