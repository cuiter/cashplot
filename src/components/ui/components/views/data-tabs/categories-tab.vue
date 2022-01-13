<template>
    <div class="full-size tab-contents">
        <span class="tab-heading">Ongecategoriseerd</span>
        <transaction-list-component v-bind:transactions="allSourceTransactions" />
        <div class="tab-splitter"></div>
        <span class="tab-heading">Categorieën</span>
        <category-list-component v-bind:categories="allCategories" />
    </div>
</template>

<script lang="ts">
import { SourceDataInfo, SourceDataInfoItem } from '../../../../../types';

export default {
    computed: {
        allSourceTransactions() {
            return (this as any).$root.$data.state.allSourceTransactions();
        },
        allCategories() {
            return (this as any).$root.$data.state.allCategories();
        }
    },
};
</script>