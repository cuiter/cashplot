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

        <nav-component v-model="currentTab" />
    </div>
</template>

<script lang="ts">
const currentTabKey = "debug/currentTab";
const currentTabDefault = "overview";

export default {
    data: function () {
        return {
            currentTab:
                window.localStorage.getItem(currentTabKey) ?? currentTabDefault,
        };
    },
    watch: {
        currentTab: function (value: string) {
            if ((this as any).$root.isDebugModeEnabled()) {
                window.localStorage.setItem(currentTabKey, value);
            }
        },
    },
};
</script>
