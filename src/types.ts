import { Type } from "class-transformer";
import "reflect-metadata";
import { hash } from "./utils";

const DECIMAL: number = 100;
export { DECIMAL };

export class Settings {
    @Type(() => Account)
    public accounts: Account[];
    @Type(() => Category)
    public categories: Category[];
    // ...
    constructor(accounts: Account[], categories: Category[]) {
        this.accounts = accounts;
        this.categories = categories;
    }
}

export class Preferences {
    public developerMode: boolean = false;
    public currentView: string | null = null;
    public currentTab: string | null = null;

    constructor(options: {
        developerMode?: boolean;
        currentView?: string | null;
        currentTab?: string | null;
    }) {
        if (options !== undefined) {
            this.developerMode = options.developerMode!;
            this.currentView = options.currentView!;
            this.currentTab = options.currentTab!;
        }
    }
}

export class Account {
    // Note: Accounts may be detected automatically from the source transactions themselves,
    //       often including their start balance.
    // Note: Auto-detected accounts will have the name set to be the same as the account.
    //       Hence, if the name is equal to the account, and if the initialBalanceOffset isn't set,
    //       and addToNet is set to its default, the account doesn't have to be stored separately.
    constructor(
        public account: string | null, // Note: A null value means that the account is a virtual account.
        public name: string,
        public initialBalance: number | null,
        public addToNet: boolean = true,
    ) {}
}

export class Category {
    @Type(() => WildcardFilter)
    public filters: WildcardFilter[];

    constructor(
        public name: string,
        public monthlyBudget: number | null,
        filters: WildcardFilter[],
    ) {
        this.filters = filters;
    }
}

export class WildcardFilter {
    // A filter is a way of automatically connecting transactions to categories.
    //
    // Note: This is a draft.
    // Note: It might be a good idea to have Filter as an abstract type.
    //       There could be many different kinds of filters, for example wildcard filters, regex filters, ML filters, etc.
    //
    constructor(
        public contraAccount: string | null,
        public description: string | null,
    ) {}
}

export class SourceDataInfo {
    constructor(
        public totalAccounts: number = 0,
        public totalTransactions: number = 0,
        public items: SourceDataInfoItem[] = [],
    ) {}
}

export class SourceDataInfoItem {
    constructor(
        public name: string,
        public startDate: Date,
        public endDate: Date,
        public nAccounts: number,
        public nTransactions: number,
    ) {}
}

export class SourceTransaction {
    public readonly hash: number;

    constructor(
        public readonly date: Date,
        public readonly amount: number,
        public readonly account: string,
        public readonly contraAccount: string | null,
        public readonly contraAccountName: string | null,
        public readonly description: string,
    ) {
        this.hash = hash(JSON.stringify(this));
    }

    public equals(other: SourceTransaction) {
        return JSON.stringify(this) === JSON.stringify(other);
    }
}
