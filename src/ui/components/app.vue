<template>
  <div class="app full-size">
    <page-component />
    <nav-component />
  </div>
</template>

<script lang="ts">
console.log("Hello");
export default {
    data(): any {
        return {
            fullName: "Hello world!"
        }
    },
}
</script>