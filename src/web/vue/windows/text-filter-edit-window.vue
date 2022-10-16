<template>
    <div class="tab-contents full-size">
        <div v-if="matchingTransactionsExpanded === false" class="full-width">
            <div class="full-width flex-space-between">
                <input
                    v-model="displayName"
                    class="flex-item-full margin-top-small text-center margin-top-small margin-bottom-small"
                    placeholder="Naam"
                />
                <remove-button-component @click.native="removeFilter" />
            </div>
            <div class="full-width flex-space-between">
                <input
                    v-model="contraAccountPattern"
                    class="flex-item-full margin-top-small text-center margin-top-small margin-bottom-small"
                    placeholder="Tegenpartij of -rekening"
                />
            </div>
            <div class="full-width flex-space-between">
                <input
                    v-model="descriptionPattern"
                    class="flex-item-full margin-top-small text-center margin-top-small margin-bottom-small"
                    placeholder="Beschrijving"
                />
            </div>
        </div>

        <div class="tab-splitter"></div>

        <div class="full-width flex-center position-relative">
            <span class="sub-tab-heading margin-top-small">Overeenkomende transacties</span>
            <button
                v-if="matchingTransactionsExpanded === false"
                class="button expand-button"
                @click="toggleMatchingTransactionsExpanded"
            >
                &#9650;
            </button>
            <button
                v-if="matchingTransactionsExpanded === true"
                class="button expand-button"
                @click="toggleMatchingTransactionsExpanded"
            >
                &#9660;
            </button>
        </div>

        <transaction-list-component :transactions="matchingTransactions" />
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import { AssignedTransaction, TextFilter } from "../../../lib/entities";

export default Vue.extend({
    data: function () {
        return {
            categoryName: "",
            filterId: null as number | null,
            displayName: "",
            matchType: "",
            contraAccountPattern: "",
            descriptionPattern: "",
            matchingTransactionsExpanded: false,
        };
    },
    computed: {
        matchingTransactions: function () {
            const transactions: AssignedTransaction[] = (
                this as any
            ).$root.$data.searcher.searchTransactions({
                categoryName: this.categoryName,
                filterId: this.filterId,
            });

            return transactions;
        },
    },
    watch: {
        displayName: function () {
            this.updateFilter();
        },
        contraAccountPattern: function () {
            this.updateFilter();
        },
        descriptionPattern: function () {
            this.updateFilter();
        },
    },
    created: function () {
        this.categoryName = (this as any).openedWindowEntry.categoryName;
        this.filterId = (this as any).openedWindowEntry.filterId;

        const categoryFilters: TextFilter[] = (this as any).$root.$data.categories.getFilters(
            this.categoryName,
        );
        const filter = categoryFilters.filter((filter) => filter.id === this.filterId)[0];

        if (filter === undefined) {
            // Filter does not exist anymore.
            (this as any).closeWindow();
            return;
        }

        this.displayName = filter.displayName;
        this.matchType = filter.matchType;
        this.contraAccountPattern = filter.matchPatterns.contraAccount;
        this.descriptionPattern = filter.matchPatterns.description;
    },
    methods: {
        removeFilter: function () {
            this.$root.$data.categories.removeFilters(this.categoryName, [this.filterId]);
            (this as any).closeWindow();
        },
        updateFilter: function () {
            if (this.filterId !== null) {
                let changedFilter = new TextFilter(this.filterId, this.displayName, this.matchType, {
                    contraAccount: this.contraAccountPattern,
                    description: this.descriptionPattern,
                });

                this.$root.$data.categories.addFilters(this.categoryName, [changedFilter]);
            }
        },
        toggleMatchingTransactionsExpanded: function () {
            this.matchingTransactionsExpanded = !this.matchingTransactionsExpanded;
        },
    },
});
</script>
