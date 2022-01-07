<template>
    <div class="collection-list">
        <div class="transaction-group">
            <span class="transaction-date-splitter">12 november 2021</span>
            <div class="collection-item">
                <span class="transaction-amount">€17,50</span>
                <div class="transaction-direction-down"></div>
                <span class="transaction-title">KPN BV</span>
                <span class="transaction-description">Simyo Prepaid Simyo</span>
            </div>
            <div class="collection-item">
                <span class="transaction-amount">€107,00</span>
                <div class="transaction-direction-up"></div>
                <span class="transaction-title">BELASTINGDIENST</span>
                <span class="transaction-description">MAAND AUG. NR. 5920294230T2984</span>
            </div>
        </div>
        <div class="transaction-group">
            <span class="transaction-date-splitter">11 november 2021</span>
            <div class="collection-item">
                <span class="transaction-amount">€17,50</span>
                <div class="transaction-direction-down"></div>
                <span class="transaction-title">KPN BV</span>
                <span class="transaction-description">Simyo Prepaid Simyo</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: ["transactions"],
};
</script>
