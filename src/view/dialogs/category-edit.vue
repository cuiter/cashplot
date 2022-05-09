<template>
    <div class="tab-contents full-size">
        <div class="full-width flex-space-between">
            <input
                v-model="categoryName"
                class="flex-item-full margin-top-small text-center margin-top-small margin-bottom-small"
            />
            <remove-button-component @click.native="removeCategory" />
        </div>
        <div class="tab-splitter"></div>
        <div class="full-width position-relative margin-top-small">
            <div class="full-width flex-center">
                <span
                    class="sub-nav-button"
                    :class="{
                        selected: currentFilterType === 'automatic',
                    }"
                    @click="switchFilterType('automatic')"
                >
                    Automatische filters
                </span>
                <span
                    class="sub-nav-button"
                    :class="{
                        selected: currentFilterType === 'manual',
                    }"
                    @click="switchFilterType('manual')"
                >
                    Handmatig toegewezen
                </span>
            </div>
            <remove-button-component
                v-if="
                    currentFilterType === 'manual' &&
                    manualTransactions.length !== 0
                "
                class="float-right manual-filter-remove-button"
                :class="{
                    inactive: selectedManualTransactionHashes.length === 0,
                }"
                @click.native="removeSelectedManualTransactions"
            />
        </div>
        <automatic-filter-list-component
            v-if="currentFilterType === 'automatic'"
            v-model="selectedManualTransactionHashes"
            :filters="filters"
            :category-name="categoryName"
        />
        <transaction-list-component
            v-if="currentFilterType === 'manual'"
            v-model="selectedManualTransactionHashes"
            :transactions="manualTransactions"
            :selectable="true"
        />
    </div>
</template>
<script lang="ts">
import { AssignedTransaction } from "../../model/entities";
export default {
    data: function () {
        return {
            categoryName: "",
            previousCategoryName: "",
            currentFilterType: "automatic",
            selectedManualTransactionHashes: [],
        };
    },
    computed: {
        manualTransactions: function () {
            return (this as any).$root.$data.searcher.searchTransactions(
                (this as any).$data.categoryName,
                "Category",
                "ManualFilter",
            );
        },
        filters: function () {
            return (this as any).$root.$data.categories.getFilters(
                (this as any).$data.categoryName,
            );
        },
    },
    watch: {
        categoryName: function () {
            let categoryName = (this as any).$data.categoryName;
            let previousCategoryName = (this as any).$data.previousCategoryName;

            if (categoryName !== previousCategoryName) {
                (this as any).$root.$data.categories.rename(
                    previousCategoryName,
                    categoryName,
                );
                (this as any).$data.previousCategoryName = categoryName;
            }
        },
    },
    created: function () {
        (this as any).$data.categoryName = (
            this as any
        ).openedDialogEntry.categoryName;
        (this as any).$data.previousCategoryName = (
            this as any
        ).$data.categoryName;
    },
    methods: {
        removeCategory: function () {
            (this as any).$root.$data.categories.remove(
                (this as any).$data.categoryName,
            );
            (this as any).closeDialog();
        },
        switchFilterType: function (type: string) {
            (this as any).$data.currentFilterType = type;
        },
        removeSelectedManualTransactions: function () {
            const selectedManualTransactionHashes = (this as any).$data
                .selectedManualTransactionHashes;
            const manualTransactions: AssignedTransaction[] = (this as any)
                .manualTransactions;
            const selectedTransactions = manualTransactions.filter(
                (transaction) =>
                    selectedManualTransactionHashes.indexOf(
                        transaction.hash,
                    ) !== -1,
            );

            const transactionManualFilterIds = selectedTransactions.map(
                (transaction) =>
                    transaction.assignments
                        .filter(
                            (assignment) =>
                                assignment.filterType === "ManualFilter",
                        )
                        .map((assignment) => assignment.filterId),
            );

            (this as any).$root.$data.categories.removeFilters(
                (this as any).$data.categoryName,
                Array.prototype.concat.apply([], transactionManualFilterIds),
            );
        },
    },
};
</script>
