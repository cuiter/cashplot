import { Exclude, Type } from "class-transformer";
import { assert, hash, wildcardToRegExp } from "../utils";
import { Period, PeriodType } from "./period";
import "reflect-metadata";

const DECIMAL = 100;
const MAX_CACHE_ENTRIES = 50;
export { DECIMAL, MAX_CACHE_ENTRIES, PeriodType };

// ========== Note: the following types are stored persistently.              ==========
// ========== When modifying, make sure to test for backwards-compatibility.  ==========

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

    /** Initializes the filter. May be overridden by child classes to contain extra logic. */
    public init() {}
}

/** Matches transactions based on content. Matches case-insensitively, supporting a wildcard character (*) or regex pattern. */
export class TextFilter extends Filter {
    @Exclude()
    private matchers: {
        contraAccount: RegExp;
        description: RegExp;
    } | null = null;

    constructor(
        id: number,
        public displayName: string, // When empty, the contra account pattern should be displayed.
        public matchType: string, // Either Wildcard or RegExp
        public matchPatterns: {
            contraAccount: string; // Matches the contraAccount and contraAccountName attributes.
            // May be empty, in which case it matches any value
            description: string; // Matches the description attribute. May be empty as well
            // Note: If both patterns are set to the empty string, the filter will not match anything.
        },
    ) {
        super(id);
    }

    /**
     * Initializes this filter, compiling the appropriate RegExp patterns.
     * Throws an exception if the given pattern is not valid.
     */
    public init() {
        // Note: This assertion is moved out of the constructor so class-transformer
        //       does not have to be modified to provide constructor arguments.
        assert(
            this.matchType === "wildcard" || this.matchType === "regexp",
            "filterType must be either 'wildcard' or 'regexp'",
        );

        if (
            this.matchPatterns.contraAccount !== "" ||
            this.matchPatterns.description !== ""
        ) {
            this.matchers = {
                contraAccount: new RegExp(
                    this.matchType === "wildcard"
                        ? wildcardToRegExp(this.matchPatterns.contraAccount)
                        : this.matchPatterns.contraAccount,
                    "i", // Case-insensitive
                ),
                description: new RegExp(
                    this.matchType === "wildcard"
                        ? wildcardToRegExp(this.matchPatterns.description)
                        : this.matchPatterns.description,
                    "i",
                ),
            };
        } else {
            const neverMatches = new RegExp("(?!x)x");
            this.matchers = {
                contraAccount: neverMatches,
                description: neverMatches,
            };
        }
    }

    /** Returns this filter's RegExp matchers with their corresponding transaction attributes. */
    public getMatchers() {
        if (this.matchers === null) {
            throw new Error("Filter has not been initialized yet.");
        } else {
            return this.matchers;
        }
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
                { value: TextFilter, name: "text" },
                { value: ManualFilter, name: "manual" },
            ],
        },
        keepDiscriminatorProperty: true,
    })
    public filters: Filter[];

    constructor(
        public name: string,
        public budgetAmount: number | null = null,
        public budgetPeriodType: PeriodType = PeriodType.Month,
        filters: Filter[] = [],
    ) {
        this.filters = filters;
    }
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

// ================== End of persistently stored types. ====================

export class Assignment {
    constructor(
        public name: string,
        public type: string, // May be Account or Category
        public filterId: number,
        public filterType: string, // Name of the filter type (e.g. TextFilter)
    ) {
        assert(
            type === "Category" ||
                type === "Account" ||
                type === "ContraAccount",
            "Assignment.type must be one of: Category, Account, ContraAccount",
        );
        assert(
            filterType.lastIndexOf("Filter") === filterType.length - 6,
            "Assignment.filterType must end with ...Filter",
        );
    }
}

export class AssignedTransaction extends SourceTransaction {
    constructor(
        transaction: SourceTransaction,
        public readonly assignments: Assignment[] = [],
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

/** Query for filtering through assigned transactions. */
export interface SearchQuery {
    categoryName?: string;
    accountId?: number /* Note: searching based on account is not implemented yet */;
    filterType?: string;
    filterId?: number;
    period?: Period;
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
