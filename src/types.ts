export interface UI {
    init(): void;
}

export interface State {
    getState(): number;
}

export interface Source {
    isValidData(transactionData: string): boolean;
    parseTransactions(transactionData: string): Array<SourceTransaction>;
}

export class SourceTransaction {
    constructor(
        public date: Date,
        public amount: number,
        public account: string,
        public contraAccount: string,
        public contraAccountName: string,
        public description: string,
    ) {}
}

const DECIMAL: number = 100;
export { DECIMAL };
