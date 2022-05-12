<template>
    <div v-if="openedWindow !== null" class="top-nav">
        <div
            v-if="
                openedWindow === 'source-data' || openedWindow === 'assignment'
            "
            class="full-size view-width flex-center"
        >
            <span
                class="top-nav-button"
                :class="{
                    selected: openedWindow === 'source-data',
                }"
                @click="
                    closeWindow();
                    openWindow('source-data', {});
                "
            >
                Bronnen
            </span>
            <span
                class="top-nav-button"
                :class="{
                    selected: openedWindow === 'assignment',
                }"
                @click="
                    closeWindow();
                    openWindow('assignment', {});
                "
            >
                Categorieën
            </span>
        </div>

        <div
            v-if="
                openedWindow === 'category-edit' ||
                openedWindow === 'text-filter-edit'
            "
            class="full-size view-width flex-space-between"
        >
            <div class="top-nav-edge flex-center">
                <span
                    v-if="openedWindow !== null"
                    class="top-nav-button"
                    :class="{ selected: true }"
                    @click="closeWindow()"
                >
                    &#60;&nbsp;
                </span>
            </div>

            <!-- Window titles -->
            <span v-if="openedWindow === 'category-edit'" class="top-nav-title">
                Categorie bewerken
            </span>
            <span
                v-if="openedWindow === 'text-filter-edit'"
                class="top-nav-title"
            >
                Filter bewerken
            </span>

            <div class="top-nav-edge" />
        </div>

        <div
            v-if="openedWindow === 'budget'"
            class="full-size view-width flex-space-between"
        >
            <selection-component
                class="top-nav-button selected border-none"
                v-model="categoryName"
                :options="categoryNames"
            />
        </div>
    </div>
</template>

<script lang="ts">
export default {
    data: function () {
        return {
            categoryName: "",
        };
    },
    watch: {
        categoryName: function () {
            if ((this as any).openedWindow === "budget") {
                (this as any).closeWindow();
                (this as any).openWindow("budget", {
                    categoryName: (this as any).$data.categoryName,
                });
                console.log("Switch" + (this as any).$data.categoryName);
            }
        },
    },
    computed: {
        categoryNames: function () {
            return (this as any).$root.$data.categories.list();
        },
    },
};
</script>
