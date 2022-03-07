<template>
    <div class="view">
        <home-view-component v-if="currentView == 'home'" />
        <data-view-component
            v-if="currentView == 'data'"
            v-bind:currentTab="currentTab"
        />
    </div>
</template>
<script lang="ts">
export default {
    props: ["currentView", "currentTab"],
};
</script>
