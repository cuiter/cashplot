import * as dayjs from "dayjs";
import * as dayOfYear from "dayjs/plugin/dayOfYear";
import * as isoWeek from "dayjs/plugin/isoWeek";
import { assert } from "../utils";

dayjs.extend(dayOfYear);
dayjs.extend(isoWeek);

// === Note: the following type is stored persistently. When modifying, make sure to test for backwards compatibility. ===
export enum PeriodType {
    Year = "year",
    Quarter = "quarter",
    Month = "month",
    Week = "week",
    Day = "day",
}
// ===

/** Represents a specific period in history. For example: Week 2 of 2022 */
export class Period {
    constructor(
        public type: PeriodType,
        public year: number,
        public periodNumber?: number /* 1-53 for PeriodType.Week, 1-12 for PeriodType.Month etc. */,
    ) {
        if (type !== PeriodType.Year) {
            assert(
                periodNumber !== undefined,
                "Period number must be set when type is not PeriodType.Year",
            );
        }
    }

    public containsDate(date: Date): boolean {
        if (this.type === PeriodType.Year) {
            return date.getFullYear() === this.year;
        } else if (this.type === PeriodType.Quarter) {
            return (
                date.getFullYear() === this.year &&
                Math.floor(date.getMonth() / 3) + 1 === this.periodNumber
            );
        } else if (this.type === PeriodType.Month) {
            return (
                date.getFullYear() === this.year &&
                date.getMonth() + 1 === this.periodNumber
            );
        } else if (this.type === PeriodType.Week) {
            return (
                date.getFullYear() === this.year &&
                dayjs(date).isoWeek() === this.periodNumber
            );
        } else if (this.type === PeriodType.Day) {
            return (
                date.getFullYear() === this.year &&
                dayjs(date).dayOfYear() === this.periodNumber
            );
        } else {
            throw new Error('Unknown period type "' + this.type + '"');
        }
    }
}
