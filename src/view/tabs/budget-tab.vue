<template>
    <div class="full-size tab-contents flex-center">
        <span>Maak een categorie aan op het "Data"-scherm</span>
    </div>
</template>
<script lang="ts">
export default {
    created: function () {
        const existingCategories: string[] = (
            this as any
        ).$root.$data.categories.list();

        if (
            (this as any).openedWindow === null &&
            existingCategories.length !== 0
        ) {
            (this as any).openWindow("budget", {
                categoryName: existingCategories[0],
            });
        }
    },
};
</script>
