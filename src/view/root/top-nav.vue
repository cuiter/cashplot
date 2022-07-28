<template>
    <div v-if="openedWindow !== null" class="top-nav">
        <div
            v-if="
                openedWindow === 'source-data' || openedWindow === 'assignment'
            "
            class="full-size view-width position-relative flex-center"
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
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="preferences-icon clickable"
                @click="openWindow('preferences-edit', {})"
            >
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                    d="M9.954 2.21a9.99 9.99 0 0 1 4.091-.002A3.993 3.993 0 0 0 16 5.07a3.993 3.993 0 0 0 3.457.261A9.99 9.99 0 0 1 21.5 8.876 3.993 3.993 0 0 0 20 12c0 1.264.586 2.391 1.502 3.124a10.043 10.043 0 0 1-2.046 3.543 3.993 3.993 0 0 0-3.456.261 3.993 3.993 0 0 0-1.954 2.86 9.99 9.99 0 0 1-4.091.004A3.993 3.993 0 0 0 8 18.927a3.993 3.993 0 0 0-3.457-.26A9.99 9.99 0 0 1 2.5 15.121 3.993 3.993 0 0 0 4 11.999a3.993 3.993 0 0 0-1.502-3.124 10.043 10.043 0 0 1 2.046-3.543A3.993 3.993 0 0 0 8 5.071a3.993 3.993 0 0 0 1.954-2.86zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
                />
            </svg>
        </div>

        <div
            v-if="
                openedWindow === 'category-edit' ||
                openedWindow === 'text-filter-edit' ||
                openedWindow === 'preferences-edit'
            "
            class="full-size view-width flex-space-between"
        >
            <div class="top-nav-edge flex-center">
                <span
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
            <span
                v-if="openedWindow === 'preferences-edit'"
                class="top-nav-title"
            >
                Instellingen
            </span>

            <div class="top-nav-edge" />
        </div>

        <budget-controls-component v-if="openedWindow === 'budget'" />
    </div>
</template>
