import { Category, Filter, Settings } from "../../model/entities";
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

        this.notifyObservers();
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

        this.notifyObservers();
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
    public all(): Category[] {
        return this.settings.categories;
    }
}
