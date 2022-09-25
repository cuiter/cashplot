<template><div /></template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    created: function () {
        if ((this as any).openedWindow === null) {
            (this as any).openWindow("source-data", null);
        }
    },
});
</script>
