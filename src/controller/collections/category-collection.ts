import { Category, Filter, Settings } from "../../model/entities";
import { CategoryCollection, Storage } from "../../interfaces";
import { findNewName } from "../../utils";

export class CategoryCollectionImpl implements CategoryCollection {
    public static inject = ["storage"] as const;

    private settings: Settings;

    constructor(private storage: Storage) {
        this.settings = storage.loadSettings() || new Settings();
    }

    public init() {}

    public add(defaultName: string): string {
        const newName = findNewName(
            defaultName,
            this.settings.categories.map((category) => category.name),
        );
        this.settings.categories.push(new Category(newName));

        this.storage.storeSettings(this.settings);
        return newName;
    }

    public remove(name: string): void {
        for (let index = 0; index < this.settings.categories.length; index++) {
            if (this.settings.categories[index].name === name) {
                this.settings.categories.splice(index, 1);
                break;
            }
        }

        this.storage.storeSettings(this.settings);
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

                this.storage.storeSettings(this.settings);
                return true;
            }
        }
        return false;
    }

    public addFilter(categoryName: string, filter: Filter): void {
        const category = this.settings.categories.filter(
            (category) => category.name == categoryName,
        )[0];
        if (category === undefined) {
            throw new Error(
                'Could not find category named "' + categoryName + '"',
            );
        }

        // Remove filter with same id if it already exists.
        const filterIds = category.filters.map((filter) => filter.id);
        if (filterIds.indexOf(filter.id) !== -1) {
            category.filters.splice(filterIds.indexOf(filter.id), 1);
        }

        category.filters.push(filter);
    }

    public removeFilter(categoryName: string, filterId: number): void {
        const category = this.settings.categories.filter(
            (category) => category.name == categoryName,
        )[0];
        if (category === undefined) {
            throw new Error(
                'Could not find category named "' + categoryName + '"',
            );
        }

        const filterIds = category.filters.map((filter) => filter.id);
        if (filterIds.indexOf(filterId) !== -1) {
            category.filters.splice(filterIds.indexOf(filterId), 1);
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

    public get(name: string): Category {
        const category = this.settings.categories.filter(
            (category) => category.name == name,
        )[0];
        if (category === undefined) {
            throw new Error('Could not find category named "' + name + '"');
        }

        return category;
    }
    public list(): string[] {
        return this.settings.categories.map((category) => category.name);
    }
}
