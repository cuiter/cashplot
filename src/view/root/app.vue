<template>
    <div class="app full-size">
        <top-nav-component />

        <div class="view view-width">
            <overview-tab-component
                v-if="openedDialog === null && currentTab == 'overview'"
            />
            <source-data-tab-component
                v-if="openedDialog === null && currentTab == 'source-data'"
            />
            <category-tab-component
                v-if="openedDialog === null && currentTab == 'category'"
            />
            <budget-tab-component
                v-if="openedDialog === null && currentTab == 'budget'"
            />
            <balance-tab-component
                v-if="openedDialog === null && currentTab == 'balance'"
            />

            <category-edit-component v-if="openedDialog === 'category-edit'" />
            <text-filter-edit-component
                v-if="openedDialog === 'text-filter-edit'"
            />
        </div>

        <bottom-nav-component />
    </div>
</template>
