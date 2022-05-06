<template>
    <div class="tab-contents full-size">
        <div class="full-width flex-space-between">
            <input
                v-model="displayName"
                class="flex-item-full margin-top-small text-center margin-top-small margin-bottom-small"
            />
            <remove-button-component @click.native="removeFilter" />
        </div>
        <div class="full-width flex-space-between">
            <input
                v-model="contraAccountPattern"
                class="flex-item-full margin-top-small text-center margin-top-small margin-bottom-small"
            />
        </div>
        <div class="full-width flex-space-between">
            <input
                v-model="descriptionPattern"
                class="flex-item-full margin-top-small text-center margin-top-small margin-bottom-small"
            />
        </div>

        <div class="tab-splitter"></div>

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
        ).openedDialogEntry.categoryName;
        (this as any).$data.filterId = (this as any).openedDialogEntry.filterId;

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
            (this as any).closeDialog();
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
    },
};
</script>
