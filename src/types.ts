export class SourceDataInfo {
    constructor(
        public name: string,
        public startDate: Date,
        public endDate: Date,
        public nAccounts: number,
        public nTransactions: number,
    ) {}
}

export class SourceTransaction {
    constructor(
        public date: Date,
        public amount: number,
        public account: string,
        public contraAccount: string | null,
        public contraAccountName: string | null,
        public description: string,
    ) {}
}

const DECIMAL: number = 100;
export { DECIMAL };
