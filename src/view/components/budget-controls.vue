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
import { DECIMAL, PeriodType } from "../../model/entities";
export default {
    data: function () {
        return {
            categoryName: "",
            budgetAmount: null,
        };
    },
    computed: {
        categoryNames: function () {
            return (this as any).$root.$data.categories.list();
        },
    },
    watch: {
        categoryName: function () {
            const newCategoryName = (this as any).categoryName;

            if (
                (this as any).openedWindow === "budget" &&
                (this as any).openedWindowEntry.categoryName !== newCategoryName
            ) {
                (this as any).closeWindow();
                (this as any).openWindow("budget", {
                    categoryName: newCategoryName,
                });

                (this as any).loadCategoryData();
            }
        },
        budgetAmount: function () {
            const newBudget = (this as any).budgetAmount;
            const categoryName = (this as any).openedWindowEntry.categoryName;

            // If new budget is not 0, empty string, etc.
            if (newBudget) {
                (this as any).$root.$data.categories.setBudget(
                    categoryName,
                    newBudget * DECIMAL,
                    PeriodType.Month,
                );
            } else {
                (this as any).$root.$data.categories.setBudget(
                    categoryName,
                    null,
                    PeriodType.Month,
                );
            }
        },
    },
    created: function () {
        (this as any).loadCategoryData();
    },
    methods: {
        loadCategoryData: function () {
            const categoryName =
                ((this as any).openedWindowEntry ?? {}).categoryName ?? null;

            if (categoryName !== null) {
                (this as any).categoryName = categoryName;

                const budgetAmount = ((this as any).budgetAmount = (
                    this as any
                ).$root.$data.categories.getBudget(categoryName).amount);

                if (budgetAmount === null) {
                    // Empty out the budget user input.
                    (this as any).budgetAmount = "";
                } else {
                    (this as any).budgetAmount = budgetAmount / DECIMAL;
                }
            }
        },
    },
};
</script>
