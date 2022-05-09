<template>
    <div class="tab-contents full-size">
        <div class="full-width" v-if="matchingTransactionsExpanded === false">
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
            <span class="sub-tab-heading margin-top-small"
                >Overeenkomende transacties</span
            >
            <button
                v-if="matchingTransactionsExpanded === false"
                class="button expand-button"
                @click="toggleMatchingTransactionsExpanded"
            >
                Toon meer
            </button>
            <button
                v-if="matchingTransactionsExpanded === true"
                class="button expand-button"
                @click="toggleMatchingTransactionsExpanded"
            >
                Toon minder
            </button>
        </div>

        <transaction-list-component :transactions="matchingTransactions" />
    </div>
</template>
<script lang="ts">
import { AssignedTransaction, TextFilter } from "../../model/entities";
export default {
    data: function () {
        return {
            categoryName: "",
            filterId: null,
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
            ).$root.$data.searcher.searchTransactions(
                (this as any).$data.categoryName,
                "Category",
                undefined,
                (this as any).$data.filterId,
            );

            return transactions;
        },
    },
    watch: {
        displayName: function () {
            (this as any).updateFilter();
        },
        contraAccountPattern: function () {
            (this as any).updateFilter();
        },
        descriptionPattern: function () {
            (this as any).updateFilter();
        },
    },
    created: function () {
        (this as any).$data.categoryName = (
            this as any
        ).openedWindowEntry.categoryName;
        (this as any).$data.filterId = (this as any).openedWindowEntry.filterId;

        const categoryFilters: TextFilter[] = (
            this as any
        ).$root.$data.categories.getFilters((this as any).$data.categoryName);
        const filter = categoryFilters.filter(
            (filter) => filter.id === (this as any).$data.filterId,
        )[0];

        (this as any).$data.displayName = filter.displayName;
        (this as any).$data.matchType = filter.matchType;
        (this as any).$data.contraAccountPattern =
            filter.matchPatterns.contraAccount;
        (this as any).$data.descriptionPattern =
            filter.matchPatterns.description;
    },
    methods: {
        removeFilter: function () {
            (this as any).$root.$data.categories.removeFilters(
                (this as any).$data.categoryName,
                [(this as any).$data.filterId],
            );
            (this as any).closeWindow();
        },
        updateFilter: function () {
            let changedFilter = new TextFilter(
                (this as any).$data.filterId,
                (this as any).$data.displayName,
                (this as any).$data.matchType,
                {
                    contraAccount: (this as any).$data.contraAccountPattern,
                    description: (this as any).$data.descriptionPattern,
                },
            );

            (this as any).$root.$data.categories.addFilters(
                (this as any).$data.categoryName,
                [changedFilter],
            );
        },
        switchFilterType: function (type: string) {
            (this as any).$data.currentFilterType = type;
        },
        toggleMatchingTransactionsExpanded: function () {
            (this as any).$data.matchingTransactionsExpanded = !(this as any)
                .$data.matchingTransactionsExpanded;
        },
    },
};
</script>
