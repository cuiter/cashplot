<template>
    <div class="collection-grid">
        <div
            v-for="category of categories"
            class="grid-item button button-dark"
            @click="selectCategory(category)"
        >
            <span class="transaction-amount">{{ category }}</span>
        </div>
        <div class="grid-item button button-light" @click="addCategory">
            Nieuw
        </div>
    </div>
</template>

<script lang="ts">
import { filter } from "vue/types/umd";
import { ManualFilter } from "../../model/entities";
import { createUniqueId } from "../../utils";
const newCategoryName = "New category";

export default {
    props: {
        categories: { type: Array, default: () => [] },
        selectedTransactionHashes: { type: Array, default: () => null },
    },
    methods: {
        addCategory() {
            (this as any).$root.$data.categories.add(newCategoryName);
        },
        selectCategory(name: string) {
            const selectedTransactionHashes: number[] = (this as any).$props
                .selectedTransactionHashes;

            if (selectedTransactionHashes.length !== 0) {
                var filters = selectedTransactionHashes.map(
                    (hash) => new ManualFilter(createUniqueId(), hash),
                );

                (this as any).$root.$data.categories.addFilters(name, filters);
            }
        },
    },
};
</script>
