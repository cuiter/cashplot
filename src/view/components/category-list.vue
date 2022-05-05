<template>
    <div class="collection-grid-container">
        <div class="collection-grid">
            <div
                v-for="category of categories"
                class="grid-item button button-dark"
                @click="selectCategory(category)"
            >
                <div class="category-name">{{ category }}</div>
            </div>
            <div class="grid-item button button-light" @click="addCategory">
                <div class="category-name">Nieuw</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
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
            const categoryName = (this as any).$root.$data.categories.add(
                newCategoryName,
            );
            (this as any).openDialog("category-edit", categoryName);
        },
        selectCategory(name: string) {
            const selectedTransactionHashes: number[] = (this as any).$props
                .selectedTransactionHashes;

            if (selectedTransactionHashes.length !== 0) {
                var filters = selectedTransactionHashes.map(
                    (hash) => new ManualFilter(createUniqueId(), hash),
                );

                selectedTransactionHashes.splice(
                    0,
                    selectedTransactionHashes.length,
                );

                (this as any).$root.$data.categories.addFilters(name, filters);
            } else {
                (this as any).openDialog("category-edit", name);
            }
        },
    },
};
</script>
