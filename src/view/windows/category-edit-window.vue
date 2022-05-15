<template>
    <div class="tab-contents full-size">
        <div class="full-width flex-space-between">
            <input
                v-model="newCategoryName"
                class="flex-item-full margin-top-small text-center margin-top-small margin-bottom-small"
                @blur="updateCategoryName"
            />
            <remove-button-component @click.native="removeCategory" />
        </div>
        <div class="tab-splitter"></div>
        <div class="full-width position-relative margin-top-small">
            <div class="full-width flex-center">
                <div class="flex-center">
                    <!-- To center nav buttons on both sides -->
                    <remove-button-component class="invisible" />
                    <span
                        class="sub-nav-button"
                        :class="{
                            selected: currentFilterType === 'automatic',
                        }"
                        @click="switchFilterType('automatic')"
                    >
                        Automatische filters
                    </span>
                </div>
                <div class="flex-center">
                    <span
                        class="sub-nav-button"
                        :class="{
                            selected: currentFilterType === 'manual',
                        }"
                        @click="switchFilterType('manual')"
                    >
                        Handmatig toegewezen
                    </span>
                    <remove-button-component
                        :class="{
                            invisible:
                                currentFilterType !== 'manual' ||
                                manualTransactions.length === 0,
                            inactive:
                                selectedManualTransactionHashes.length === 0,
                        }"
                        @click.native="removeSelectedManualTransactions"
                    />
                </div>
            </div>
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
import Vue from "vue";

export default Vue.extend({
    data: function () {
        return {
            categoryName: "",
            newCategoryName: "",
            currentFilterType: "automatic",
            selectedManualTransactionHashes: [] as number[],
        };
    },
    computed: {
        manualTransactions: function () {
            return this.$root.$data.searcher.searchTransactions(
                this.$data.categoryName,
                "Category",
                "ManualFilter",
            );
        },
        filters: function () {
            return this.$root.$data.categories.getFilters(
                this.$data.categoryName,
            );
        },
    },
    created: function () {
        this.categoryName = (this as any).openedWindowEntry.categoryName;
        this.newCategoryName = (this as any).$data.categoryName;
    },
    methods: {
        removeCategory: function () {
            this.$root.$data.categories.remove(this.categoryName);
            (this as any).closeWindow();
        },
        updateCategoryName: function () {
            let categoryName = this.categoryName;
            let newCategoryName = this.newCategoryName;

            if (newCategoryName !== categoryName) {
                this.$root.$data.categories.rename(
                    categoryName,
                    newCategoryName,
                );
                this.categoryName = newCategoryName;
                (this as any).changeWindowEntry({
                    categoryName: newCategoryName,
                });
            }
        },
        switchFilterType: function (type: string) {
            this.currentFilterType = type;
        },
        removeSelectedManualTransactions: function () {
            const selectedManualTransactionHashes =
                this.selectedManualTransactionHashes;
            const manualTransactions: AssignedTransaction[] =
                this.manualTransactions;
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

            this.$root.$data.categories.removeFilters(
                this.categoryName,
                Array.prototype.concat.apply([], transactionManualFilterIds),
            );
        },
    },
});
</script>
