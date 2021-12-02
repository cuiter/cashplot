<template>
    <div class="page">
        <home-view v-if="currentView == 'data'" />
        <p>{{currentView}}</p>
    </div>
</template>
<script lang="ts">
export default {
    inject: ["currentView"]
}
</script>