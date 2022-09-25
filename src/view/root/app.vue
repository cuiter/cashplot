<template>
    <div class="app full-size">
        <top-nav-component />

        <div class="view view-width">
            <overview-tab-component v-if="openedWindow === null && currentTab == 'overview'" />
            <data-tab-component v-if="openedWindow === null && currentTab == 'data'" />
            <budget-tab-component v-if="openedWindow === null && currentTab == 'budget'" />
            <balance-tab-component v-if="openedWindow === null && currentTab == 'balance'" />

            <category-edit-window-component v-if="openedWindow === 'category-edit'" />
            <text-filter-edit-window-component v-if="openedWindow === 'text-filter-edit'" />
            <source-data-window-component v-if="openedWindow === 'source-data'" />
            <assignment-window-component v-if="openedWindow === 'assignment'" />
            <budget-window-component v-if="openedWindow === 'budget'" />
            <preferences-edit-window-component v-if="openedWindow === 'preferences-edit'" />
        </div>

        <bottom-nav-component />
    </div>
</template>
