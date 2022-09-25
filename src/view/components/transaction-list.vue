<template>
    <div class="collection-list">
        <div v-for="item of transactionsByDate" class="transaction-group">
            <span class="transaction-date-splitter">{{ item.date }}</span>
            <div
                v-for="transaction of item.transactions"
                class="collection-item"
                :class="{
                    selectable: selectable,
                    clickable: selectable,
                    selected: value.indexOf(transaction.hash) !== -1,
                }"
                @click="selectTransaction(transaction.hash)"
            >
                <span class="transaction-amount"
                    >€{{
                        Math.abs(transaction.amount / DECIMAL)
                            .toFixed(2)
                            .replace(".", ",")
                    }}</span
                >
                <div v-if="transaction.amount < 0" class="transaction-direction-down" />
                <div v-if="transaction.amount >= 0" class="transaction-direction-up" />
                <span class="transaction-title">{{
                    transaction.contraAccountName || transaction.contraAccount
                }}</span>
                <span class="transaction-description">{{ transaction.description }}</span>
            </div>
        </div>

        <infinite-loading @infinite="infiniteHandler" />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as dayjs from "dayjs";
import { DECIMAL, SourceTransaction } from "../../model/entities";

const transactionDateFormat = "D MMMM YYYY";
const defaultItemsLoaded = 50;
const itemIncrement = 20;

export default Vue.extend({
    props: {
        value: { type: Array, default: () => [] }, // Hashes of selected transactions
        transactions: { type: Array, default: () => [] },
        selectable: { type: Boolean, default: () => false },
    },
    data: () => {
        return {
            itemsLoaded: defaultItemsLoaded,
        };
    },
    computed: {
        DECIMAL: () => DECIMAL,
        transactionsByDate: function () {
            var transactionsByDate = {} as any;

            (this.transactions as SourceTransaction[])
                .map((tr) => tr)
                .reverse()
                .slice(0, this.itemsLoaded)
                .forEach((transaction) => {
                    var timeStr = transaction.date.getTime().toString();

                    if (!Object.prototype.hasOwnProperty.call(transactionsByDate, timeStr)) {
                        transactionsByDate[timeStr] = [];
                    }
                    transactionsByDate[timeStr].push(transaction);
                });

            return Object.keys(transactionsByDate).map((timeStr) => {
                return {
                    date: dayjs(new Date(Number(timeStr))).format(transactionDateFormat),
                    transactions: transactionsByDate[timeStr],
                };
            });
        },
    },
    watch: {
        transactions: function () {
            const selectedTransactionHashes: number[] = this.$props.value;
            const transactions: SourceTransaction[] = this.$props.transactions;

            const existingHashes = new Set(transactions.map((transaction) => transaction.hash));

            const existingSelectedTransactionHashes = selectedTransactionHashes.filter((hash) =>
                existingHashes.has(hash),
            );

            if (existingSelectedTransactionHashes.length !== selectedTransactionHashes.length) {
                this.$props.value = existingSelectedTransactionHashes;
                this.$emit("input", this.$props.value);
            }
        },
    },
    methods: {
        infiniteHandler($state: any) {
            this.itemsLoaded += itemIncrement;
            if (this.itemsLoaded < this.transactions.length) {
                $state.loaded();
            } else {
                $state.complete();
            }
        },

        selectTransaction(transactionHash: number) {
            const selectedTransactionIndex = this.$props.value.indexOf(transactionHash);
            if (selectedTransactionIndex === -1) {
                this.$props.value.push(transactionHash);
            } else {
                this.$props.value.splice(selectedTransactionIndex, 1);
            }
            this.$emit("input", this.$props.value);
        },
    },
});
</script>
