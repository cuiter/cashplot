<template>
    <div class="tab-contents full-size">
        <div class="sources-summary">
            <div>
                <span class="sources-summary-stat">{{
                    allSourceDataInfo.totalAccounts
                }}</span>
                <svg
                    class="sources-summary-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                        d="M2 22a8 8 0 1 1 16 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm7.363 2.233A7.505 7.505 0 0 1 22.983 22H20c0-2.61-1-4.986-2.637-6.767zm-2.023-2.276A7.98 7.98 0 0 0 18 7a7.964 7.964 0 0 0-1.015-3.903A5 5 0 0 1 21 8a4.999 4.999 0 0 1-5.66 4.957z"
                    />
                </svg>
                <br />
                <span class="sources-summary-label">Accounts</span>
            </div>
            <div>
                <span class="sources-summary-stat sources-summary-stat-wide">{{
                    allSourceDataInfo.totalTransactions
                }}</span>
                <svg
                    class="sources-summary-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                        d="M19.375 15.103A8.001 8.001 0 0 0 8.03 5.053l-.992-1.737A9.996 9.996 0 0 1 17 3.34c4.49 2.592 6.21 8.142 4.117 12.77l1.342.774-4.165 2.214-.165-4.714 1.246.719zM4.625 8.897a8.001 8.001 0 0 0 11.345 10.05l.992 1.737A9.996 9.996 0 0 1 7 20.66C2.51 18.068.79 12.518 2.883 7.89L1.54 7.117l4.165-2.214.165 4.714-1.246-.719zm8.79 5.931L10.584 12l-2.828 2.828-1.414-1.414 4.243-4.242L13.414 12l2.829-2.828 1.414 1.414-4.243 4.242z"
                    />
                </svg>
                <br />
                <span class="sources-summary-label">Transacties</span>
            </div>
        </div>
        <div class="collection-list">
            <div
                v-for="item of allSourceDataInfo.items"
                class="collection-item"
            >
                <span class="source-data-name">{{ item.name }}</span>
                <!--NOTE: If the viewport gets really small, change the date format-->
                <span class="source-data-date">{{
                    getInfoItemDisplayDate(item)
                }}</span>
                <span class="source-data-accounts">{{ item.nAccounts }}</span>
                <svg
                    class="source-data-accounts-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                        d="M2 22a8 8 0 1 1 16 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm7.363 2.233A7.505 7.505 0 0 1 22.983 22H20c0-2.61-1-4.986-2.637-6.767zm-2.023-2.276A7.98 7.98 0 0 0 18 7a7.964 7.964 0 0 0-1.015-3.903A5 5 0 0 1 21 8a4.999 4.999 0 0 1-5.66 4.957z"
                    />
                </svg>
                <!--NOTE: Change the number format if the #items gets above 5 digits-->
                <span class="source-data-transactions">{{
                    item.nTransactions
                }}</span>
                <svg
                    class="source-data-transactions-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                        d="M19.375 15.103A8.001 8.001 0 0 0 8.03 5.053l-.992-1.737A9.996 9.996 0 0 1 17 3.34c4.49 2.592 6.21 8.142 4.117 12.77l1.342.774-4.165 2.214-.165-4.714 1.246.719zM4.625 8.897a8.001 8.001 0 0 0 11.345 10.05l.992 1.737A9.996 9.996 0 0 1 7 20.66C2.51 18.068.79 12.518 2.883 7.89L1.54 7.117l4.165-2.214.165 4.714-1.246-.719zm8.79 5.931L10.584 12l-2.828 2.828-1.414-1.414 4.243-4.242L13.414 12l2.829-2.828 1.414 1.414-4.243 4.242z"
                    />
                </svg>
                <svg
                    class="source-data-remove-button clickable float-right"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 22"
                    width="24"
                    height="24"
                    @click="onRemoveSourceDataPressed(item.name)"
                >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                        d="M4 8h16v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8zm3-3V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h5v2H2V5h5zm2-1v1h6V4H9zm0 8v6h2v-6H9zm4 0v6h2v-6h-2z"
                    />
                </svg>
            </div>
            <div
                v-if="allSourceDataInfo.length === 0"
                class="no-source-data-message"
            >
                <span>Er zijn nog geen bronnen toegevoegd.</span>
                <br /><br />
                <ul>
                    <li>
                        Selecteer een bank en druk op de "Open"-knop om naar de
                        bankomgeving te navigeren
                    </li>
                    <li>Exporteer je transacties in CSV-formaat.</li>
                    <li>
                        Druk vervolgens op de "Voeg Toe"-knop om dit CSV-bestand
                        te gebruiken.
                    </li>
                </ul>
            </div>
        </div>
        <div class="sources-entry flex-center">
            <button
                class="button flex-item-full"
                @click="toggleSourceSelectionOpen()"
                @blur="sourceSelectionOpen = false"
            >
                <div
                    class="sources-selection"
                    :class="{ disabled: sourceSelectionOpen === false }"
                >
                    <span
                        v-for="name of sourceSelectionNames"
                        @click="onSourceItemSelected"
                        >{{ name }}</span
                    >
                </div>
                <span class="float-left select-name">{{
                    sourceProperties[selectedSource].name
                }}</span>
                <span class="float-right select-tick">▲</span>
            </button>
            <button
                class="sources-entry-open-button button"
                @click="onOpenButtonPressed"
            >
                Open
            </button>
            <label class="button" for="source-data-upload">Voeg toe</label>
            <input
                id="source-data-upload"
                ref="sourceDataUpload"
                type="file"
                multiple="multiple"
                class="disabled"
                @change="onSourceDataUpload"
            />
        </div>
    </div>
</template>

<script lang="ts">
import * as dayjs from "dayjs";
import { SourceDataInfo, SourceDataInfoItem } from "../../model/entities";

const infoDateWidthThresholdRem = 40;
const longInfoDateFormat = "D MMMM YYYY";
const shortInfoDateFormat = "D MMM. YYYY";

/**
 * Wraps and debounces an event handler, making sure it only gets called once every <wait> milliseconds.
 * Note: Also calls the handler <wait> milliseconds after the last trigger.
 */
function debounce(func: any, wait: number) {
    var timeout: NodeJS.Timeout | null;
    var lastCalled: number | null;
    return function (this: any) {
        var context = this,
            args = arguments;

        var callIfBouncePeriodOver = () => {
            if (!lastCalled || Date.now() - lastCalled >= wait) {
                func.apply(context, args);
                lastCalled = Date.now();
            }

            clearTimeout(timeout!);
        };

        callIfBouncePeriodOver();
        timeout = setTimeout(callIfBouncePeriodOver, wait);
    };
}

export default {
    props: ["currentTab"],
    data: function () {
        return {
            sourceSelectionOpen: false,
            selectedSource: "ing",
            sourceProperties: {
                ing: {
                    name: "ING",
                    url: "https://mijn.ing.nl/",
                },
                sns: {
                    name: "SNS Bank",
                    url: "https://www.snsbank.nl/online/web/mijnsns/",
                },
                rabobank: {
                    name: "Rabobank",
                    url: "https://bankieren.rabobank.nl/klanten",
                },
                triodos: {
                    name: "Triodos Bank",
                    url: "https://bankieren.triodos.nl/",
                },
                "abn-amro": {
                    name: "ABN Amro",
                    url: "https://www.abnamro.nl/portal/mijn-abnamro/authenticatie/inloggen/index.html",
                },
                bunq: {
                    name: "Bunq",
                    url: "https://bunq.app/",
                },
            },
            infoDateFormat: longInfoDateFormat,
            resizeEventHandler: null,
        };
    },

    computed: {
        sourceSelectionNames(): string[] {
            const selectedSource = (this as any).$data.selectedSource;
            const sourceProperties = (this as any).$data.sourceProperties;

            return Object.keys(sourceProperties)
                .filter((source) => source !== selectedSource)
                .map((source) => sourceProperties[source].name);
        },

        allSourceDataInfo() {
            return (this as any).$root.$data.sourceData.allInfo();
        },
    },

    mounted: function () {
        (this as any).$data.resizeEventHandler = debounce(
            (this as any).updateInfoDateFormat,
            50,
        );
        window.addEventListener(
            "resize",
            (this as any).$data.resizeEventHandler,
        );
        (this as any).updateInfoDateFormat();
    },
    beforeDestroy: function () {
        window.removeEventListener("resize", (this as any).resizeEventHandler);
    },

    methods: {
        toggleSourceSelectionOpen(open: boolean | null = null) {
            if (open === null) {
                (this as any).$data.sourceSelectionOpen = !(this as any).$data
                    .sourceSelectionOpen;
            } else {
                (this as any).$data.sourceSelectionOpen = open;
            }
        },

        onSourceItemSelected(event: any) {
            var name = event.target.textContent;
            var sourceProperties = (this as any).$data.sourceProperties;

            for (const source of Object.keys(sourceProperties)) {
                if (sourceProperties[source].name === name) {
                    (this as any).$data.selectedSource = source;
                }
            }
        },

        onOpenButtonPressed() {
            const selectedSource = (this as any).$data.selectedSource;
            const sourceProperties = (this as any).$data.sourceProperties;

            window.open(sourceProperties[selectedSource].url, "_blank");
        },

        onSourceDataUpload(event: any) {
            const fileList = event.target.files; // eslint-disable-line no-invalid-this
            if (fileList.length > 0) {
                for (var idx = 0; idx < fileList.length; idx++) {
                    const file = fileList[idx];
                    const reader = new FileReader();
                    reader.addEventListener("loadend", (event) => {
                        try {
                            const result = event.target?.result;
                            (this as any).$root.$data.sourceData.add(
                                file.name,
                                result,
                            );
                        } catch (err) {
                            (this as any).$root.handleError(err);
                        } finally {
                            // Reset input to allow user to select any file again.
                            (this as any).$refs.sourceDataUpload.value = "";
                        }
                    });
                    reader.readAsText(file);
                }
            }
        },

        updateInfoDateFormat() {
            const widthThresholdPx =
                infoDateWidthThresholdRem *
                parseFloat(getComputedStyle(document.documentElement).fontSize);
            if (window.innerWidth >= widthThresholdPx) {
                (this as any).$data.infoDateFormat = longInfoDateFormat;
            } else {
                (this as any).$data.infoDateFormat = shortInfoDateFormat;
            }
        },

        getInfoItemDisplayDate(item: SourceDataInfoItem): string {
            const dateFormat: string = (this as any).$data.infoDateFormat;

            return (
                dayjs(item.startDate).format(longInfoDateFormat) +
                " - " +
                dayjs(item.endDate).format(dateFormat)
            );
        },

        onRemoveSourceDataPressed(name: string) {
            return (this as any).$root.$data.sourceData.remove(name);
        },
    },
};
</script>
