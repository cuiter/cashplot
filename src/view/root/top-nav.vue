<template>
    <div v-if="value === 'source-data' || value === 'category'" class="tab-nav">
        <span
            class="tab-nav-button"
            :class="{ selected: value === 'source-data' }"
            @click="openTab('source-data')"
        >
            Bronnen
        </span>
        <span
            class="tab-nav-button"
            :class="{ selected: value === 'category' }"
            @click="openTab('category')"
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
