<template>
    <div class="collection-list">
        <div class="transaction-group" v-for="item of transactionsByDate">
            <span class="transaction-date-splitter">{{ item.date }}</span>
            <div
                class="collection-item"
                v-for="transaction of item.transactions"
            >
                <span class="transaction-amount"
                    >€{{
                        Math.abs(transaction.amount / DECIMAL)
                            .toFixed(2)
                            .replace(".", ",")
                    }}</span
                >
                <div
                    class="transaction-direction-down"
                    v-if="transaction.amount < 0"
                ></div>
                <div
                    class="transaction-direction-up"
                    v-if="transaction.amount >= 0"
                ></div>
                <span class="transaction-title">{{
                    transaction.contraAccountName || transaction.contraAccount
                }}</span>
                <span class="transaction-description">{{
                    transaction.description
                }}</span>
            </div>
        </div>

        <infinite-loading @infinite="infiniteHandler" />
    </div>
</template>

<script lang="ts">
import { DECIMAL, SourceTransaction } from "../../../types";
import * as dayjs from "dayjs";

const transactionDateFormat = "D MMMM YYYY";
const defaultItemsLoaded = 50;
const itemIncrement = 20;

export default {
    props: ["transactions"],
    data: () => {
        return {
            itemsLoaded: defaultItemsLoaded,
        };
    },
    methods: {
        infiniteHandler($state: any) {
            (this as any).$data.itemsLoaded += itemIncrement;
            if (
                (this as any).$data.itemsLoaded <
                (this as any).transactions.length
            ) {
                $state.loaded();
            } else {
                $state.complete();
            }
        },
    },
    computed: {
        DECIMAL: () => DECIMAL,
        transactionsByDate: function () {
            var transactionsByDate = {} as any;

            ((this as any).transactions as SourceTransaction[])
                .map((tr) => tr)
                .reverse()
                .slice(0, (this as any).$data.itemsLoaded)
                .forEach((transaction) => {
                    var timeStr = transaction.date.getTime().toString();

                    if (!transactionsByDate.hasOwnProperty(timeStr)) {
                        transactionsByDate[timeStr] = [];
                    }
                    transactionsByDate[timeStr].push(transaction);
                });

            return Object.keys(transactionsByDate).map((timeStr) => {
                return {
                    date: dayjs(new Date(Number(timeStr))).format(
                        transactionDateFormat,
                    ),
                    transactions: transactionsByDate[timeStr],
                };
            });
        },
    },
};
</script>
