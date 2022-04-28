<template>
    <div class="collection-grid">
        <div
            class="grid-item button button-dark"
            v-for="category of categories"
        >
            <span class="transaction-amount">{{ category }}</span>
        </div>
        <div class="grid-item button button-light" @click="addCategory">
            Nieuw
        </div>
    </div>
</template>

<script lang="ts">
import { DECIMAL, SourceTransaction } from "../../model/entities";
import * as dayjs from "dayjs";

const transactionDateFormat = "D MMMM YYYY";
const defaultItemsLoaded = 50;
const itemIncrement = 20;

export default {
    props: ["categories"],
    methods: {
        addCategory() {
            (this as any).$root.$data.categories.add();
        },
    },
};
</script>
