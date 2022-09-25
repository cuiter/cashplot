import { Category, Filter, PeriodType, Settings } from "../../model/entities";
import { Storage } from "../../model/storage";
import { findNewName } from "../../utils";
import { Observable } from "@daign/observable";

/**
 * Stores a collection of categories, including budgets and filters.
 * Provides methods for modifying the collection.
 */
export interface CategoryCollection {
    /** Initializes storage and restores state from previous session if available */
    init(): void;

    /**
     * Adds a new category to the collection. Returns the new name.
     */
    add(defaultName: string): string;
    /**
     * Removes the category and its associated filters from the collection.
     */
    remove(name: string): void;
    /**
     * Renames a category.
     * Returns whether the rename was successful (i.e. whether there no conflicting category existed).
     */
    rename(name: string, newName: string): boolean;

    /**
     * Sets the budget for the specified category.
     * Note: The budget must be multiplied by entities.DECIMAL to become an integer,
     *       to avoid floating point storage-related inconsistencies.
     */
    setBudget(
        name: string,
        budgetAmount: number | null,
        budgetPeriodType: PeriodType,
    ): void;

    /**
     * Returns the budget for the specified category.
     */
    getBudget(name: string): { amount: number | null; periodType: PeriodType };

    /**
     * Adds filters to the category. If a filter with the same id already exists, it is replaced.
     */
    addFilters(categoryName: string, filters: Filter[]): void;
    /**
     * Removes filters from the category.
     * Note: Throws an error if one of the given filter ids do not exist.
     */
    removeFilters(categoryName: string, filterId: number[]): void;
    /** Returns the filters of the category. */
    getFilters(name: string): Filter[];

    /** Returns the names of all categories. */
    list(): string[];
    /** Returns all categories in the collection. */
    all(): Category[];
    /** Allows another component to subscribe to any changes in this component. */
    subscribeToChanges(callback: () => void): void;
}

export class CategoryCollectionImpl
    extends Observable
    implements CategoryCollection
{
    public static inject = ["storage"] as const;

    private settings: Settings;

    constructor(private storage: Storage) {
        super();

        this.settings = new Settings();
    }

    public init() {
        this.settings = this.storage.loadSettings() || this.settings;

        for (const category of this.settings.categories) {
            for (const filter of category.filters) {
                filter.init();
            }
        }

        // Save settings to storage when any changes are made.
        this.subscribeToChanges(() => {
            this.storage.storeSettings(this.settings);
        });
    }

    public add(defaultName: string): string {
        const newName = findNewName(
            defaultName,
            this.settings.categories.map((category) => category.name),
        );
        this.settings.categories.push(new Category(newName));

        this.notifyObservers();
        return newName;
    }

    public remove(name: string): void {
        for (let index = 0; index < this.settings.categories.length; index++) {
            if (this.settings.categories[index].name === name) {
                this.settings.categories.splice(index, 1);
                break;
            }
        }

        this.notifyObservers();
    }

    public rename(name: string, newName: string): boolean {
        if (name === newName) return true;

        const existingNames = this.settings.categories.map(
            (category) => category.name,
        );
        if (existingNames.indexOf(newName) !== -1) {
            return false;
        }

        for (const category of this.settings.categories) {
            if (category.name === name) {
                category.name = newName;

                this.notifyObservers();
                return true;
            }
        }
        return false;
    }

    private get(name: string): Category {
        const category = this.settings.categories.filter(
            (category) => category.name == name,
        )[0];
        if (category === undefined) {
            throw new Error('Could not find category named "' + name + '"');
        }

        return category;
    }

    public setBudget(
        name: string,
        budgetAmount: number | null,
        budgetPeriodType: PeriodType,
    ): void {
        const category = this.get(name);
        category.budgetAmount = budgetAmount;
        category.budgetPeriodType = budgetPeriodType;

        this.notifyObservers();
    }

    public getBudget(name: string) {
        const category = this.get(name);

        return {
            amount: category.budgetAmount,
            periodType: category.budgetPeriodType,
        };
    }

    public addFilters(categoryName: string, filters: Filter[]): void {
        const category = this.get(categoryName);

        // Remove filters with same id if they already exist.
        const filterIds = category.filters.map((filter) => filter.id);
        for (const filter of filters) {
            filter.init();

            const filterIndex = filterIds.indexOf(filter.id);
            if (filterIndex !== -1) {
                category.filters[filterIndex] = filter;
            } else {
                category.filters.push(filter);
            }
        }

        this.notifyObservers();
    }

    public removeFilters(categoryName: string, filterIds: number[]): void {
        const category = this.get(categoryName);

        const existingFilterIds = category.filters.map((filter) => filter.id);
        for (const filterId of filterIds) {
            const filterIndex = existingFilterIds.indexOf(filterId);

            if (filterIndex !== -1) {
                category.filters.splice(filterIndex, 1);
                existingFilterIds.splice(filterIndex, 1);
            } else {
                throw new Error(
                    "Could not find filter with id " +
                        filterId +
                        ' inside category "' +
                        categoryName +
                        '"',
                );
            }
        }

        this.notifyObservers();
    }

    public getFilters(name: string): Filter[] {
        const category = this.get(name);

        return category.filters;
    }

    public list(): string[] {
        return this.settings.categories.map((category) => category.name);
    }
    public all(): Category[] {
        return this.settings.categories;
    }
}
