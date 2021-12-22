const DECIMAL: number = 100;
export { DECIMAL };

export class Settings {
    constructor(accounts: Account[], categories: Category[]) {}
    // ...
}

export class Preferences {
    // darkMode: boolean,
    // language: string,
    // currency: string,
    // ...
}

export class Account {
    // Note: Accounts may be detected automatically from the source transactions themselves,
    //       often including their start balance.
    // Note: Auto-detected accounts will have the name set to be the same as the account.
    //       Hence, if the name is equal to the account, and if the initialBalanceOverride isn't set,
    //       and addToNet is set to its default, the account doesn't have to be stored separately.
    constructor(
        public account: string | null, // Note: A null value means that the account is a virtual account.
        public name: string,
        public initialBalance: number, // Note: Auto-detected from source transactions.
        public initialBalanceOverride: number | null,
        public addToNet: boolean = true,
    ) {}
}

export class Category {
    constructor(
        public name: string,
        public budgetPerMonth: number,
        public filters: WildcardFilter[],
    ) {}
}

export class WildcardFilter {
    // A filter is a way of automatically connecting transactions to categories.
    //
    // Note: This is a draft.
    // Note: It might be a good idea to have Filter as an abstract type.
    //       There could be many different kinds of filters, for example wildcard filters, regex filters, ML filters, etc.
    //
    constructor(
        public account: string | null,
        public contraAccount: string | null,
        public description: string | null,
    ) {}
}

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
