import { Category, Filter, PeriodType, Settings } from "../../model/entities";
import { CategoryCollection, Storage } from "../../interfaces";
import { findNewName } from "../../utils";
import { Observable } from "@daign/observable";

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
