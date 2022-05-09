<template>
    <div class="full-size tab-contents">
        <transaction-list-component :transactions="transactions" />
    </div>
</template>
<script lang="ts">
export default {
    created: function () {
        const existingCategories: string[] = (
            this as any
        ).$root.$data.categories.list();

        if (existingCategories.length !== 0) {
            const categoryName = ((this as any).openedWindowEntry ?? {})
                .categoryName;

            if (existingCategories.indexOf(categoryName) === -1) {
                (this as any).closeWindow();
                (this as any).openWindow("budget", {
                    categoryName: categoryName,
                });
            }
        }
    },
    computed: {
        transactions: function () {
            const categoryName = (this as any).openedWindowEntry.categoryName;

            if (categoryName) {
                return (this as any).$root.$data.searcher.searchTransactions(
                    categoryName,
                    "Category",
                );
            } else {
                return [];
            }
        },
    },
};
</script>
