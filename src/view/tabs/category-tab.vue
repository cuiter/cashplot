<template>
    <div class="full-size tab-contents">
        <span class="tab-heading">Ongecategoriseerd</span>
        <transaction-list-component v-bind:transactions="allTransactions" />
        <div class="tab-splitter"></div>
        <span class="tab-heading">Categorieën</span>
        <category-list-component v-bind:categories="allCategories" />
    </div>
</template>

<script lang="ts">
import { SourceDataInfo, SourceDataInfoItem } from "../../model/entities";

export default {
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
