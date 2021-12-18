<template>
    <div>
        <sources-tab-component v-if="currentTab == 'sources'" />
        <p v-if="currentTab == 'accounts'">Accounts</p>
        <p v-if="currentTab == 'categories'">Categorieën</p>
    </div>
</template>

<script lang="ts">
export default {
    props: ["currentTab"],
};
</script>