import { Type } from "class-transformer";
import "reflect-metadata";
import { hash } from "../utils";

const DECIMAL = 100;
export { DECIMAL };

export class Settings {
    @Type(() => Account)
    public accounts: Account[];
    @Type(() => Category)
    public categories: Category[];
    // ...
    constructor(accounts: Account[] = [], categories: Category[] = []) {
        this.accounts = accounts;
        this.categories = categories;
    }
}

export class Preferences {}

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

/** A filter is a way of automatically connecting transactions to categories. */
export class Filter {
    /** Unique identifier for this filter */
    public readonly id: number;

    constructor(id: number) {
        this.id = id;
    }
}

/** Matches transactions based on content. Matches case-insensitively, supporting a wildcard character. */
export class WildcardFilter extends Filter {
    constructor(
        id: number,
        public contraAccount: string,
        public description: string,
    ) {
        super(id);
    }
}

/** Matches a single transaction. Used in manual transaction assignments. */
export class ManualFilter extends Filter {
    constructor(id: number, public transactionHash: number) {
        super(id);
    }
}

export class Category {
    @Type(() => Filter, {
        discriminator: {
            property: "type",
            subTypes: [
                { value: WildcardFilter, name: "wildcard" },
                { value: ManualFilter, name: "manual" },
            ],
        },
        keepDiscriminatorProperty: true,
    })
    public filters: Filter[];

    constructor(
        public name: string,
        public monthlyBudget: number | null = null,
        filters: Filter[] = [],
    ) {
        this.filters = filters;
    }
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
        return this.hash === other.hash;
    }

    /** Overrides the hash of this transaction. For testing purposes only. */
    public overrideHash(hash: number): SourceTransaction {
        (this as any).hash = hash; // eslint-disable-line

        return this;
    }
}

export class AssignedTransaction extends SourceTransaction {
    constructor(
        transaction: SourceTransaction,
        public readonly assignedCategories: Category[],
        public readonly assignedAccount: Account | null,
        public readonly assignedContraAccount: Account | null,
    ) {
        super(
            transaction.date,
            transaction.amount,
            transaction.account,
            transaction.contraAccount,
            transaction.contraAccountName,
            transaction.description,
        );
    }
}
