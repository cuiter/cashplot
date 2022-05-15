<template>
    <div class="full-size tab-contents">
        <transaction-list-component :transactions="transactions" />
    </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    computed: {
        transactions: function () {
            const categoryName = ((this as any).openedWindowEntry ?? {})
                .categoryName;

            if (categoryName) {
                return this.$root.$data.searcher.searchTransactions(
                    categoryName,
                    "Category",
                );
            } else {
                return [];
            }
        },
    },
    created: function () {
        // If the current category does not exist anymore,
        // open the first category that does exist.
        const categoryName = ((this as any).openedWindowEntry ?? {})
            .categoryName;
        const existingCategories: string[] = (
            this as any
        ).$root.$data.categories.list();

        if (existingCategories.indexOf(categoryName) === -1) {
            (this as any).closeWindow();
        }
    },
});
</script>
