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
import { AssignedTransaction } from "../../model/entities";
import Vue from "vue";

export default Vue.extend({
    data: () => {
        return {
            selectedTransactionHashes: [],
        };
    },
    computed: {
        allTransactions() {
            return this.$root.$data.assigner
                .allTransactions()
                .filter(
                    (transaction: AssignedTransaction) =>
                        transaction.assignments.length === 0,
                );
        },
        allCategories() {
            return this.$root.$data.categories.list();
        },
    },
});
</script>
