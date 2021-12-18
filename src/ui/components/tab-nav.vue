<template>
    <div class="tab-nav">
        <span
            class="tab-nav-button"
            @click="openTab('sources')"
            v-bind:class="{ selected: value === 'sources' }">
            Bronnen
        </span>
        <span
            class="tab-nav-button"
            @click="openTab('accounts')"
            v-bind:class="{ selected: value === 'accounts' }">
            Accounts
        </span>
        <span
            class="tab-nav-button"
            @click="openTab('categories')"
            v-bind:class="{ selected: value === 'categories' }">
            Categorieën
        </span>
    </div>
</template>

<script lang="ts">
export default {
    props: ["value"],
    methods: {
        openTab(tab: string) {
            (this as any).$props.value = tab;
            (this as any).$emit("input", tab);
        },
    },
};
</script>
