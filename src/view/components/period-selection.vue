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
import { Period, PeriodsPerYear } from "../../model/period";
import { range } from "../../utils";

export default Vue.extend({
    props: {
        value: {
            type: Object,
            default: () => null,
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
            year: new Date().getFullYear().toString(),
            period: "1",
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
        rangeStartDate: function () {
            this.generateOptions();
        },
        rangeEndDate: function () {
            this.generateOptions();
        },
    },
    created: function () {
        if (this.$props.value === null) {
            let endDate = this.rangeEndDate as Date;
            let endYear = endDate.getFullYear();

            this.$data.year = endYear.toString();
            for (
                let periodNumber =
                    PeriodsPerYear[this.$data.type as PeriodType];
                periodNumber >= 1;
                periodNumber--
            ) {
                if (
                    new Period(
                        this.$data.type,
                        endYear,
                        periodNumber,
                    ).containsDate(endDate)
                ) {
                    this.$data.period = periodNumber.toString();
                    break;
                }
            }
            this.emitPeriod();
        } else {
            const period: Period = this.$props.value;
            this.$data.type = period.type;
            this.$data.year = period.year.toString();
            this.$data.period = (period.periodNumber ?? 1).toString();
        }
        this.generateOptions();
    },
    methods: {
        generateOptions: function () {
            let startYear = (this.rangeStartDate as Date).getFullYear();
            let endYear = (this.rangeEndDate as Date).getFullYear();

            const yearOptions = [];
            for (let year = endYear; year >= startYear; year--) {
                yearOptions.push(year.toString());
            }
            this.yearOptions = yearOptions;

            if (this.type === PeriodType.Quarter) {
                // Note: This should be moved elsewhere once translations are implemented.
                this.periodOptions = range(1, 4).map((num) => num.toString());
                this.periodNames = ["Q1", "Q2", "Q3", "Q4"];
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
                Number(this.period) || undefined,
            );
            this.$emit("input", this.$props.value);
        },
    },
});
</script>
