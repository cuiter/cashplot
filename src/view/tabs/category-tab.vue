<template>
    <div class="full-size tab-contents">
        <span class="tab-heading">Ongecategoriseerd</span>
        <transaction-list-component
            v-model="selectedTransactionHashes"
            :transactions="allTransactions"
            :selectable="true"
        />
        <div class="tab-splitter" />
        <span class="tab-heading">Categorieën</span>
        <category-list-component
            :categories="allCategories"
            :selected-transaction-hashes="selectedTransactionHashes"
        />
    </div>
</template>

<script lang="ts">
export default {
    data: () => {
        return {
            selectedTransactionHashes: [],
        };
    },
    computed: {
        allTransactions() {
            return (this as any).$root.$data.sourceData.allTransactions();
        },
        allCategories() {
            return (this as any).$root.$data.categories.list();
        },
    },
};
</script>
