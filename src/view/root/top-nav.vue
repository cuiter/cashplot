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

        <budget-controls-component v-if="openedWindow === 'budget'" />
    </div>
</template>
