<template>
    <div class="full-size view-width flex-space-between">
        <selection-component
            class="top-nav-button selected border-none"
            v-model="categoryName"
            :options="categoryNames"
        />

        <div class="budget-entry">
            <input
                v-model="budgetAmount"
                placeholder="-"
                type="number"
                min="0"
                class="text-center"
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
            budgetAmount: null as null | number,
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
                (this as any).closeWindow();
                (this as any).openWindow("budget", {
                    categoryName: newCategoryName,
                });

                this.loadCategoryData();
            }
        },
        budgetAmount: function () {
            const newBudget = this.budgetAmount;
            const categoryName = (this as any).openedWindowEntry.categoryName;

            // If new budget is not 0, empty string, etc.
            if (newBudget) {
                this.$root.$data.categories.setBudget(
                    categoryName,
                    newBudget * DECIMAL,
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
    created: function () {
        this.loadCategoryData();
    },
    methods: {
        loadCategoryData: function () {
            const categoryName =
                ((this as any).openedWindowEntry ?? {}).categoryName ?? null;

            if (categoryName !== null) {
                this.categoryName = categoryName;

                const budgetAmount = (this.budgetAmount =
                    this.$root.$data.categories.getBudget(categoryName).amount);

                if (budgetAmount === null) {
                    // Empty out the budget user input.
                    this.budgetAmount = null;
                } else {
                    this.budgetAmount = budgetAmount / DECIMAL;
                }
            }
        },
    },
});
</script>
