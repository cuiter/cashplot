import { createInjector } from "typed-inject";
import { CategoryCollectionImpl } from "../../../src/controller/collections/category-collection";
import {
    Category,
    DECIMAL,
    ManualFilter,
    Settings,
} from "../../../src/model/entities";
import { StorageMock } from "./source-data-collection.test";

describe("CategoryCollectionImpl", () => {
    const injector = createInjector();

    test("should add a category to its collection", () => {
        const categoryCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(CategoryCollectionImpl);

        expect(categoryCollection.list()).toEqual([]);

        expect(categoryCollection.add("New category")).toBe("New category");
        expect(categoryCollection.add("New category")).toBe("New category (1)");

        const categories = categoryCollection.list();
        expect(categories.length).toBe(2);
        expect(categories[0]).toBe("New category");
        expect(categories[1]).toBe("New category (1)");
    });

    test("should remove a category from its collection", () => {
        const categoryCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(CategoryCollectionImpl);

        categoryCollection.add("New category");
        categoryCollection.add("New category");

        categoryCollection.remove("New category");

        const categories = categoryCollection.list();
        expect(categories.length).toBe(1);
        expect(categories[0]).toBe("New category (1)");
    });

    test("should rename a category in its collection", () => {
        const categoryCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(CategoryCollectionImpl);

        categoryCollection.add("Category 1");
        categoryCollection.add("Category 2");

        const success = categoryCollection.rename(
            "Category 2",
            "Category Test",
        );

        const categories = categoryCollection.list();
        expect(success).toBe(true);
        expect(categories.length).toBe(2);
        expect(categories[0]).toBe("Category 1");
        expect(categories[1]).toBe("Category Test");
    });

    test("should return a category with a given name", () => {
        const categoryCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(CategoryCollectionImpl);

        categoryCollection.add("Category 1");
        categoryCollection.add("Category 2");

        const category = categoryCollection.get("Category 2");

        expect(category.name).toBe("Category 2");
    });

    test("should return all categories in the collection", () => {
        const categoryCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(CategoryCollectionImpl);

        categoryCollection.add("Category 1");
        categoryCollection.add("Category 2");

        const categories = categoryCollection.all();

        expect(categories.length).toBe(2);
        expect(categories[0].name).toBe("Category 1");
        expect(categories[1].name).toBe("Category 2");
    });

    test("should add a filter to a category", () => {
        const categoryCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(CategoryCollectionImpl);

        categoryCollection.add("New category");

        categoryCollection.addFilter(
            "New category",
            new ManualFilter(0x3528, 0x9302323),
        );

        const category = categoryCollection.get("New category");
        expect(category.filters.length).toBe(1);
        expect(category.filters[0]).toBeInstanceOf(ManualFilter);
        expect(category.filters[0].id).toBe(0x3528);
        expect((category.filters[0] as ManualFilter).transactionHash).toBe(
            0x9302323,
        );

        // Override filter with new filter
        categoryCollection.addFilter(
            "New category",
            new ManualFilter(0x3528, 0x10239234),
        );

        const overriddenCategory = categoryCollection.get("New category");
        expect(overriddenCategory.filters.length).toBe(1);
        expect(overriddenCategory.filters[0]).toBeInstanceOf(ManualFilter);
        expect(overriddenCategory.filters[0].id).toBe(0x3528);
        expect(
            (overriddenCategory.filters[0] as ManualFilter).transactionHash,
        ).toBe(0x10239234);
    });

    test("should remove a filter from a category", () => {
        const categoryCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(CategoryCollectionImpl);

        categoryCollection.add("New category");

        categoryCollection.addFilter(
            "New category",
            new ManualFilter(0x3528, 0x9302323),
        );
        categoryCollection.addFilter(
            "New category",
            new ManualFilter(0x6934, 0x2393803),
        );

        categoryCollection.removeFilter("New category", 0x3528);

        const category = categoryCollection.get("New category");
        expect(category.filters.length).toBe(1);
        expect(category.filters[0]).toBeInstanceOf(ManualFilter);
        expect(category.filters[0].id).toBe(0x6934);
        expect((category.filters[0] as ManualFilter).transactionHash).toBe(
            0x2393803,
        );
    });

    test("should load categories from persistent storage", () => {
        const storageMock = new StorageMock();
        storageMock.storeSettings(
            new Settings(
                [],
                [
                    new Category("Category 1", 100 * DECIMAL, []),
                    new Category("Category 2", 100 * DECIMAL, []),
                ],
            ),
        );
        const categoryCollection = injector
            .provideValue("storage", storageMock)
            .injectClass(CategoryCollectionImpl);

        categoryCollection.init();

        const categoryList = categoryCollection.list();
        expect(categoryList.length).toBe(2);
        expect(categoryList[0]).toBe("Category 1");
        expect(categoryList[1]).toBe("Category 2");
    });

    test("should store categories to persistent storage", () => {
        const storageMock = new StorageMock();
        const categoryCollection = injector
            .provideValue("storage", storageMock)
            .injectClass(CategoryCollectionImpl);

        categoryCollection.init();

        categoryCollection.add("Category 1");
        categoryCollection.add("Category 2");

        const storedSettings = storageMock.loadSettings()!; // eslint-disable-line

        expect(storedSettings.categories.length).toBe(2);
        expect(storedSettings.categories[0].name).toBe("Category 1");
        expect(storedSettings.categories[1].name).toBe("Category 2");
    });
});
