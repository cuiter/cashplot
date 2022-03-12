import {
    Category,
    Settings,
    SourceDataInfo,
    SourceDataInfoItem,
    SourceTransaction,
} from "../../model/types";
import {
    Persistence,
    Sources,
    SourceDataCollection,
    Transactions,
    CategoryCollection,
} from "../interfaces";
import { findNewName } from "../../utils";

export class CategoryCollectionImpl implements CategoryCollection {
    private settings: Settings;

    constructor() {
        this.settings = new Settings();
    }

    public init() {}

    public add(): string {
        const newName = findNewName(
            "New category",
            this.settings.categories.map((category) => category.name),
        );
        this.settings.categories.push(new Category(newName));

        return newName;
    }

    public list(): string[] {
        return this.settings.categories.map((category) => category.name);
    }
}
