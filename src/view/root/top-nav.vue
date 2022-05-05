<template>
    <div
        v-if="currentTab === 'source-data' || currentTab === 'category'"
        class="top-nav"
    >
        <div
            :class="{
                'full-size': true,
                'view-width': true,
                'flex-center': openedDialog === null,
                'flex-space-between': openedDialog !== null,
            }"
        >
            <div class="top-nav-edge flex-center">
                <span
                    v-if="openedDialog !== null"
                    class="top-nav-button"
                    :class="{ selected: true }"
                    @click="closeDialog()"
                >
                    &#60;&nbsp;
                </span>
            </div>

            <!-- Category tab buttons -->

            <span
                class="top-nav-button"
                :class="{
                    disabled: openedDialog !== null,
                    selected: currentTab === 'source-data',
                }"
                @click="switchTab('source-data')"
            >
                Bronnen
            </span>
            <span
                v-if="openedDialog === null"
                class="top-nav-button"
                :class="{
                    disabled: openedDialog !== null,
                    selected: currentTab === 'category',
                }"
                @click="switchTab('category')"
            >
                Categorieën
            </span>

            <!-- Dialog titles -->
            <span v-if="openedDialog === 'category-edit'" class="top-nav-title">
                Categorie bewerken
            </span>

            <div class="top-nav-edge" />
        </div>
    </div>
</template>
