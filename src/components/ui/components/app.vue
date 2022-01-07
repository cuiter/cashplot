<template>
    <div class="app full-size">
        <tab-nav-component v-if="currentView === 'data'" v-model="currentTab" v-bind:currentView="currentView" />
        <view-component v-bind:currentView="currentView" v-bind:currentTab="currentTab" />
        <nav-component v-model="currentView" />
    </div>
</template>

<script lang="ts">
const currentViewKey = "debug/currentView";
const currentViewDefault = "home";
const currentTabKey = "debug/currentTab";
const currentTabDefault = "sources";

export default {
    data: function () {
        return {
            currentView: window.localStorage.getItem(currentViewKey) ?? currentViewDefault,
            currentTab: window.localStorage.getItem(currentTabKey) ?? currentTabDefault
        };
    },
    watch: {
        currentView: function (value: string) {
            if ((this as any).$root.isDebugModeEnabled()) {
                window.localStorage.setItem(currentViewKey, value);
            }
        },
        currentTab: function (value: string) {
            if ((this as any).$root.isDebugModeEnabled()) {
                window.localStorage.setItem(currentTabKey, value);
            }
        }
    }
};
</script>
