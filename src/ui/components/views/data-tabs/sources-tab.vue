<template>
    <div class="sources-tab full-size">
        <div class="sources-summary">
            <div>
                <span class="sources-summary-stat">4</span>
                <svg class="sources-summary-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M2 22a8 8 0 1 1 16 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm7.363 2.233A7.505 7.505 0 0 1 22.983 22H20c0-2.61-1-4.986-2.637-6.767zm-2.023-2.276A7.98 7.98 0 0 0 18 7a7.964 7.964 0 0 0-1.015-3.903A5 5 0 0 1 21 8a4.999 4.999 0 0 1-5.66 4.957z"/></svg>
                <br>
                <span class="sources-summary-label">Accounts</span>
            </div>
            <div>
                <span class="sources-summary-stat sources-summary-stat-wide">5561</span>
                <svg class="sources-summary-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M19.375 15.103A8.001 8.001 0 0 0 8.03 5.053l-.992-1.737A9.996 9.996 0 0 1 17 3.34c4.49 2.592 6.21 8.142 4.117 12.77l1.342.774-4.165 2.214-.165-4.714 1.246.719zM4.625 8.897a8.001 8.001 0 0 0 11.345 10.05l.992 1.737A9.996 9.996 0 0 1 7 20.66C2.51 18.068.79 12.518 2.883 7.89L1.54 7.117l4.165-2.214.165 4.714-1.246-.719zm8.79 5.931L10.584 12l-2.828 2.828-1.414-1.414 4.243-4.242L13.414 12l2.829-2.828 1.414 1.414-4.243 4.242z"/></svg>
                <br>
                <span class="sources-summary-label">Transacties</span>
            </div>
        </div>
        <div class="sources-list">
            <div class="sources-item" v-for="a of [1, 2, 3]">
                <span class="sources-item-name">Alle_Rekeningen_01-01-2014_11-23-2021.csv</span>
                <!--NOTE: If the viewport gets really small, change the date format-->
                <span class="sources-item-date">28 augustus 2021 - 30 september 2021</span>
                <span class="sources-item-accounts">4</span>
                <svg class="sources-item-accounts-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M2 22a8 8 0 1 1 16 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm7.363 2.233A7.505 7.505 0 0 1 22.983 22H20c0-2.61-1-4.986-2.637-6.767zm-2.023-2.276A7.98 7.98 0 0 0 18 7a7.964 7.964 0 0 0-1.015-3.903A5 5 0 0 1 21 8a4.999 4.999 0 0 1-5.66 4.957z"/></svg>
                <!--NOTE: Change the number format if the #items gets above 5 digits-->
                <span class="sources-item-transactions">5432</span>
                <svg class="sources-item-transactions-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M19.375 15.103A8.001 8.001 0 0 0 8.03 5.053l-.992-1.737A9.996 9.996 0 0 1 17 3.34c4.49 2.592 6.21 8.142 4.117 12.77l1.342.774-4.165 2.214-.165-4.714 1.246.719zM4.625 8.897a8.001 8.001 0 0 0 11.345 10.05l.992 1.737A9.996 9.996 0 0 1 7 20.66C2.51 18.068.79 12.518 2.883 7.89L1.54 7.117l4.165-2.214.165 4.714-1.246-.719zm8.79 5.931L10.584 12l-2.828 2.828-1.414-1.414 4.243-4.242L13.414 12l2.829-2.828 1.414 1.414-4.243 4.242z"/></svg>
                <svg class="sources-item-remove-button clickable float-right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 22" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 8h16v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8zm3-3V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h5v2H2V5h5zm2-1v1h6V4H9zm0 8v6h2v-6H9zm4 0v6h2v-6h-2z"/></svg>
            </div>
        </div>
        <div class="sources-entry flex-center">
            <button class="button flex-item-full"
                    @click="toggleSourceSelectionOpen()">
                <div class="sources-options"
                     v-bind:class="{ disabled: sourceSelectionOpen === false }">
                    <span>SNS Bank</span>
                    <span>Rabobank</span>
                    <span>Triodos</span>
                    <span>ABN Amro</span>
                    <span>Bunq</span>
                </div>
                <span class="float-left">ING</span>
                <span class="float-right select-tick">▲</span>
            </button>
            <button class="button">Open</button>
            <button class="button">Voeg toe</button>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: ["currentTab"],
    data: function () {
        return {
            sourceSelectionOpen: false,
        }
    },
    methods: {
        toggleSourceSelectionOpen(open: boolean | null = null) {
            if (open === null) {
                (this as any).$data.sourceSelectionOpen = !(this as any).$data.sourceSelectionOpen;
            } else {
                (this as any).$data.sourceSelectionOpen = open;
            }
        },
    },
};
</script>