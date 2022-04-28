<template>
    <div class="tab-nav" v-if="value === 'source-data' || value === 'category'">
        <span
            class="tab-nav-button"
            @click="openTab('source-data')"
            v-bind:class="{ selected: value === 'source-data' }"
        >
            Bronnen
        </span>
        <span
            class="tab-nav-button"
            @click="openTab('category')"
            v-bind:class="{ selected: value === 'category' }"
        >
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
