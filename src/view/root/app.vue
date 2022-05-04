<template>
    <div class="app full-size">
        <top-nav-component v-model="currentTab" />

        <div class="view">
            <overview-tab-component v-if="currentTab == 'overview'" />
            <source-data-tab-component v-if="currentTab == 'source-data'" />
            <category-tab-component v-if="currentTab == 'category'" />
            <budget-tab-component v-if="currentTab == 'budget'" />
            <balance-tab-component v-if="currentTab == 'balance'" />
        </div>

        <bottom-nav-component v-model="currentTab" />
    </div>
</template>
