<template>
    <div class="collection-list">
        <div
            v-for="filter of textFilters"
            class="collection-item clickable"
            :class="{
                clickable: selectable,
            }"
            @click="openFilter(filter.id)"
        >
            <span class="source-data-name text-center">{{
                filter.displayName
            }}</span>
            <span class="source-data-transactions">{{
                transactionsInFilter(filter.id)
            }}</span>
            <svg
                class="source-data-transactions-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
            >
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                    d="M19.375 15.103A8.001 8.001 0 0 0 8.03 5.053l-.992-1.737A9.996 9.996 0 0 1 17 3.34c4.49 2.592 6.21 8.142 4.117 12.77l1.342.774-4.165 2.214-.165-4.714 1.246.719zM4.625 8.897a8.001 8.001 0 0 0 11.345 10.05l.992 1.737A9.996 9.996 0 0 1 7 20.66C2.51 18.068.79 12.518 2.883 7.89L1.54 7.117l4.165-2.214.165 4.714-1.246-.719zm8.79 5.931L10.584 12l-2.828 2.828-1.414-1.414 4.243-4.242L13.414 12l2.829-2.828 1.414 1.414-4.243 4.242z"
                />
            </svg>
            <remove-button-component
                class="source-data-remove-button float-right"
                @click.native.stop.prevent="removeFilter(filter.id)"
            />
        </div>
        <div class="button button-light flex-center" @click="addFilter">
            <span class="category-name">Nieuw</span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { TextFilter } from "../../model/entities";
import { createUniqueId, findNewName } from "../../utils";

export default Vue.extend({
    props: {
        filters: { type: Array, default: () => [] },
        categoryName: { type: String, default: () => "" },
    },
    computed: {
        textFilters: function () {
            return this.filters.filter(
                (filter) => filter instanceof TextFilter,
            );
        },
    },
    methods: {
        addFilter() {
            const categoryName = this.$props.categoryName;

            const existingFilters = (
                this as any
            ).$root.$data.categories.getFilters(categoryName);
            const newFilter = new TextFilter(
                createUniqueId(),
                findNewName(
                    "New filter",
                    existingFilters
                        .filter((filter: any) => filter instanceof TextFilter)
                        .map((filter: TextFilter) => filter.displayName),
                ),
                "wildcard",
                {
                    contraAccount: "",
                    description: "",
                },
            );

            this.$root.$data.categories.addFilters(categoryName, [newFilter]);
            (this as any).openWindow("text-filter-edit", {
                categoryName: categoryName,
                filterId: newFilter.id,
            });
        },

        openFilter(filterId: number) {
            (this as any).openWindow("text-filter-edit", {
                categoryName: this.$props.categoryName,
                filterId: filterId,
            });
        },

        removeFilter(filterId: number) {
            this.$root.$data.categories.removeFilters(
                this.$props.categoryName,
                [filterId],
            );
        },

        transactionsInFilter: function (filterId: number) {
            return this.$root.$data.searcher.searchTransactions(
                this.$props.categoryName,
                "Category",
                undefined,
                filterId,
            ).length as number;
        },
    },
});
</script>
