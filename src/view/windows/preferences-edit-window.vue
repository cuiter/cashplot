<template>
    <div class="tab-contents full-size">
        <span class="tab-heading">Gegevensbeheer</span>
        <div class="margin-bottom-small"></div>
        <button class="button margin-bottom-small" @click="exportData">Exporteer alle gegevens</button
        ><br />
        <a id="export-data-link" class="disabled"></a>
        <!-- Used for creating a download prompt. -->
        <label class="button" for="export-upload">Importeer gegevens</label>
        <input
            id="export-upload"
            ref="exportUpload"
            type="file"
            accept="application/json"
            multiple="multiple"
            class="disabled"
            @change="onExportUpload"
        /><br />
        <i> Deze optie maakt het mogelijk om gegevens uit te wisselen tussen apparaten. </i>
    </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    methods: {
        exportData: function () {
            const jsonData = (this as any).$root.$data.storage.exportJson();

            const data = new Blob([jsonData], { type: "application/json" });
            const url = window.URL.createObjectURL(data);
            const exportDataLink = document.getElementById("export-data-link") as HTMLLinkElement;
            exportDataLink.href = url;
            (exportDataLink as any).download = "cashplot-export.json";
            exportDataLink.click();
            window.URL.revokeObjectURL(url);
        },
        onExportUpload: function (event: any) {
            const fileList = event.target.files; // eslint-disable-line no-invalid-this
            if (fileList.length > 0) {
                const file = fileList[0];
                const reader = new FileReader();
                reader.addEventListener("loadend", (event) => {
                    try {
                        const result = event.target?.result;
                        this.$root.$data.storage.importJson(result);
                        (this as any).closeWindow();
                        window.location.reload();
                    } catch (err) {
                        (this as any).$root.handleError(err);
                    } finally {
                        // Reset input to allow user to select any file again.
                        (this as any).$refs.exportUpload.value = "";
                    }
                });
                reader.readAsText(file);
            }
        },
    },
});
</script>
