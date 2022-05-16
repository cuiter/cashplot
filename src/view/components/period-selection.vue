<template>
    <div class="full-width flex-center margin-top-small">
        <option-selection-component
            v-model="type"
            class="period-selection-year"
            :options="typeOptions"
            :option-names="typeDisplayOptions"
            :drop-down="true"
        />
        <option-selection-component
            v-model="year"
            class="margin-left-small margin-right-small"
            :options="yearOptions"
            :drop-down="true"
        />
        <option-selection-component
            v-if="type !== 'year'"
            v-model="period"
            class="margin-right-small"
            :options="periodOptions"
            :option-names="periodNames"
            :drop-down="true"
        />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { PeriodType } from "../../model/entities";
import { Period } from "../../model/period";
import { range } from "../../utils";

export default Vue.extend({
    props: {
        value: {
            type: Object,
            default: () =>
                new Period(
                    PeriodType.Month,
                    new Date().getFullYear(),
                    new Date().getMonth() + 1,
                ),
        },
        rangeStartDate: { type: Date, default: () => new Date() },
        rangeEndDate: { type: Date, default: () => new Date() },
    },
    data: () => {
        return {
            typeOptions: Object.values(PeriodType) as string[],
            typeDisplayOptions: [
                "Jaar",
                "Kwartaal",
                "Maand",
                "Week",
                "Dag",
            ] as string[],
            yearOptions: [] as string[],
            periodOptions: [] as string[],
            periodNames: [] as string[],
            type: "month",
            year: "2022",
            period: "november",
        };
    },
    watch: {
        type: function () {
            this.generateOptions();
            this.emitPeriod();
        },
        year: function () {
            this.emitPeriod();
        },
        period: function () {
            this.emitPeriod();
        },
    },
    created: function () {
        this.generateOptions();
    },
    methods: {
        generateOptions: function () {
            let startYear = (this.rangeStartDate as Date).getFullYear();
            let endYear = (this.rangeEndDate as Date).getFullYear();

            const yearOptions = [];
            for (let year = startYear; year <= endYear; year++) {
                yearOptions.push(year.toString());
            }
            this.yearOptions = yearOptions;

            if (this.type === PeriodType.Quarter) {
                // Note: This should be moved elsewhere once translations are implemented.
                this.periodOptions = range(1, 4).map((num) => num.toString());
                this.periodNames = [
                    "1 (Januari t/m Maart)",
                    "2 (April t/m Juni)",
                    "3 (Juli t/m September)",
                    "4 (Oktober t/m December)",
                ];
            } else if (this.type === PeriodType.Month) {
                this.periodOptions = range(1, 12).map((num) => num.toString());
                this.periodNames = [
                    "Januari",
                    "Februari",
                    "Maart",
                    "April",
                    "Mei",
                    "Juni",
                    "Juli",
                    "Augustus",
                    "September",
                    "Oktober",
                    "November",
                    "December",
                ];
            } else if (this.type === PeriodType.Week) {
                this.periodOptions = range(1, 53).map((num) => num.toString());
                this.periodNames = range(1, 53).map(
                    (weekNumber) => "Week " + weekNumber.toString(),
                );
            } else if (this.type === PeriodType.Day) {
                this.periodOptions = range(1, 366).map((num) => num.toString());
                this.periodNames = range(1, 366).map(
                    (dayNumber) => "Dag " + dayNumber.toString(),
                );
            }

            if (this.periodOptions.indexOf(this.period) === -1) {
                this.period = this.periodOptions[0];
            }
        },

        emitPeriod: function () {
            this.$props.value = new Period(
                this.type as PeriodType,
                Number(this.year),
                Number(this.period),
            );
            this.$emit("input", this.$props.value);
        },
    },
});
</script>
