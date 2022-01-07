<template>
    <div class="full-size">
        <sources-tab-component v-if="currentTab == 'sources'" />
        <categories-tab-component v-if="currentTab == 'categories'" />
    </div>
</template>

<script lang="ts">
export default {
    props: ["currentTab"],
};
</script>