<template>
    <div class="app full-size">
        <tab-nav-component v-if="currentView === 'data'" v-model="currentTab" v-bind:currentView="currentView" />
        <view-component v-bind:currentView="currentView" v-bind:currentTab="currentTab" />
        <nav-component v-model="currentView" />
    </div>
</template>

<script lang="ts">
export default {
    data: function () {
        return {
            currentView: "home",
            currentTab: "sources"
        };
    },
};
</script>
