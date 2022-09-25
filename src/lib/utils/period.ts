import * as dayjs from "dayjs";
import * as dayOfYear from "dayjs/plugin/dayOfYear";
import * as isoWeek from "dayjs/plugin/isoWeek";
import { assert } from ".";

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

export const PeriodsPerYear = {
    [PeriodType.Year]: 1,
    [PeriodType.Quarter]: 4,
    [PeriodType.Month]: 12,
    [PeriodType.Week]: 53,
    [PeriodType.Day]: 366,
};

/** Represents a specific period in history. For example: Week 2 of 2022 */
export class Period {
    constructor(
        public type: PeriodType,
        public year: number,
        public periodNumber:
            | number
            | null = null /* 1-53 for PeriodType.Week, 1-12 for PeriodType.Month etc. */,
    ) {
        if (type !== PeriodType.Year) {
            assert(!Number.isNaN(periodNumber), "Period number must not be NaN");
            assert(
                Math.floor(periodNumber!) === periodNumber, // eslint-disable-line
                "Period number must be a valid integer",
            );
            assert(
                periodNumber! >= 1, // eslint-disable-line
                "Period number must be greater than or equal to 1",
            );
            assert(
                periodNumber! <= PeriodsPerYear[type], // eslint-disable-line
                "Period number must be valid. Expected within range: (1, " +
                    PeriodsPerYear[type] +
                    "), got: " +
                    periodNumber,
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
            return date.getFullYear() === this.year && date.getMonth() + 1 === this.periodNumber;
        } else if (this.type === PeriodType.Week) {
            return date.getFullYear() === this.year && dayjs(date).isoWeek() === this.periodNumber;
        } else if (this.type === PeriodType.Day) {
            return date.getFullYear() === this.year && dayjs(date).dayOfYear() === this.periodNumber;
        } else {
            throw new Error('Unknown period type "' + this.type + '"');
        }
    }
}
