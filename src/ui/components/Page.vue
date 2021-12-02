<template>
  <p>Hello, {{ fullName }}</p>
</template>

<script lang="ts">
console.log("Hello");
export default {
    name: 'Page',
    data(): any {
        return {
            fullName: "Hello world!"
        }
    },
}
</script>