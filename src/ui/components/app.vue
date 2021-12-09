<template>
    <div class="app full-size">
        <page-component v-bind:currentView="currentView" />
        <nav-component v-model="currentView" />
    </div>
</template>

<script lang="ts">
export default {
    data: function () {
        return {
            currentView: "home",
        };
    },
};
</script>
