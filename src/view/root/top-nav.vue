<template>
    <div
        v-if="currentTab === 'source-data' || currentTab === 'category'"
        class="tab-nav"
    >
        <span
            class="tab-nav-button"
            :class="{ selected: currentTab === 'source-data' }"
            @click="switchTab('source-data')"
        >
            Bronnen
        </span>
        <span
            class="tab-nav-button"
            :class="{ selected: currentTab === 'category' }"
            @click="switchTab('category')"
        >
            Categorieën
        </span>
    </div>
</template>
