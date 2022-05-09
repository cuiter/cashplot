<template><div /></template>
<script lang="ts">
export default {
    created: function () {
        if ((this as any).openedWindow === null) {
            (this as any).openWindow("budget", { categoryName: null });
        }
    },
};
</script>
