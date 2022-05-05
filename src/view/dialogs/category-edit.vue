<template>
    <div class="tab-contents full-size">
        <div class="full-width flex-space-between">
            <input
                v-model="categoryName"
                class="flex-item-full margin-top-small text-center margin-top-small margin-bottom-small"
            />
            <remove-button-component @click.native="removeCategory" />
        </div>
        <div class="tab-splitter"></div>
        <div class="full-width position-relative margin-top-small">
            <div class="full-width flex-center">
                <span
                    class="sub-nav-button"
                    :class="{
                        selected: currentFilterType === 'automatic',
                    }"
                    @click="switchFilterType('automatic')"
                >
                    Automatische filters
                </span>
                <span
                    class="sub-nav-button"
                    :class="{
                        selected: currentFilterType === 'manual',
                    }"
                    @click="switchFilterType('manual')"
                >
                    Handmatig toegewezen
                </span>
            </div>
            <remove-button-component
                v-if="currentFilterType === 'manual'"
                class="float-right manual-filter-remove-button"
                @click.native="removeSelectedManualTransactions"
            />
        </div>
        <transaction-list-component
            v-if="currentFilterType === 'manual'"
            v-model="selectedManualTransactionHashes"
            :transactions="manualTransactions"
            :selectable="true"
        />
    </div>
</template>
<script lang="ts">
export default {
    data: function () {
        return {
            categoryName: "",
            previousCategoryName: "",
            currentFilterType: "automatic",
            selectedManualTransactionHashes: [],
        };
    },
    computed: {
        manualTransactions: function () {
            return (this as any).$root.$data.assigner.allTransactions();
        },
    },
    watch: {
        categoryName: function () {
            let categoryName = (this as any).$data.categoryName;
            let previousCategoryName = (this as any).$data.previousCategoryName;

            if (categoryName !== previousCategoryName) {
                (this as any).$root.$data.categories.rename(
                    previousCategoryName,
                    categoryName,
                );
                (this as any).$data.previousCategoryName = categoryName;
            }
        },
    },
    created: function () {
        (this as any).$data.categoryName = (this as any).openedDialogEntry;
        (this as any).$data.previousCategoryName = (
            this as any
        ).$data.categoryName;
    },
    methods: {
        removeCategory: function () {
            (this as any).$root.$data.categories.remove(
                (this as any).$data.categoryName,
            );
            (this as any).closeDialog();
        },
        switchFilterType: function (type: string) {
            (this as any).$data.currentFilterType = type;
        },
        removeSelectedManualTransactions: function () {
            // TODO: implement
        },
    },
};
</script>
