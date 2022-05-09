<template>
    <div class="collection-list">
        <div
            v-for="filter of filters"
            v-if="filter.type === 'text'"
            class="collection-item"
            :class="{
                clickable: selectable,
            }"
            @click="openFilter(filter.id)"
        >
            <span class="transaction-title">{{ filter.displayName }}</span>
            <remove-button-component @click.native="removeFilter(filter.id)" />
        </div>
        <div
            class="collection-item button button-light flex-center"
            @click="addFilter"
        >
            <span>Nieuw</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Filter, TextFilter } from "../../model/entities";
import { createUniqueId, findNewName } from "../../utils";
export default {
    props: {
        filters: { type: Array, default: () => [] },
        categoryName: { type: String, default: () => "" },
    },
    methods: {
        addFilter() {
            const categoryName = (this as any).$props.categoryName;

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

            (this as any).$root.$data.categories.addFilters(categoryName, [
                newFilter,
            ]);
            (this as any).openWindow("text-filter-edit", {
                categoryName: categoryName,
                filterId: newFilter.id,
            });
        },

        openFilter(filterId: number) {
            (this as any).openWindow("text-filter-edit", {
                categoryName: (this as any).$props.categoryName,
                filterId: filterId,
            });
        },

        removeFilter(filterId: number) {
            (this as any).$root.$data.categories.removeFilters(
                (this as any).$props.categoryName,
                [filterId],
            );
        },
    },
};
</script>
