<template>
    <div class="full-size tab-contents">
        <transaction-list-component v-bind:transactions="allSourceTransactions"></transaction-list-component>
    </div>
</template>

<script lang="ts">
import { SourceDataInfo, SourceDataInfoItem } from '../../../../../types';

export default {
    computed: {
        allSourceTransactions() {
            return (this as any).$root.$data.state.allSourceTransactions();
        },
    },
};
</script>