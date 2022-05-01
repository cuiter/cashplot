<template>
    <div class="collection-grid">
        <div
            v-for="category of categories"
            class="grid-item button button-dark"
        >
            <span class="transaction-amount">{{ category }}</span>
        </div>
        <div class="grid-item button button-light" @click="addCategory">
            Nieuw
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: ["categories"],
    methods: {
        addCategory() {
            (this as any).$root.$data.categories.add();
        },
    },
};
</script>
