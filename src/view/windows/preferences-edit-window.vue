<template>
    <div class="tab-contents full-size">
        <span class="tab-heading">Gegevensbeheer</span>
        <div class="margin-bottom-small"></div>
        <button class="button margin-bottom-small" @click="exportData">
            Exporteer alle gegevens</button
        ><br />
        <label class="button" for="export-upload">Importeer gegevens</label>
        <input
            id="export-upload"
            ref="exportUpload"
            type="file"
            accept="text/csv"
            multiple="multiple"
            class="disabled"
            @change="onExportUpload"
        /><br />
        <i>
            Deze optie maakt het mogelijk om gegevens uit te wisselen tussen
            apparaten.
        </i>
    </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    methods: {
        exportData: function () {
            (this as any).closeWindow();
        },
        onExportUpload: function () {},
    },
});
</script>
