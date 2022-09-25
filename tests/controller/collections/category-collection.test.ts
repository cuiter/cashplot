import { createInjector } from "typed-inject";
import { CategoryCollectionImpl } from "../../../src/controller/collections/category-collection";
import { Category, DECIMAL, ManualFilter, PeriodType, Settings } from "../../../src/model/entities";
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

        const result = categoryCollection.rename("Category 2", "Category Test");

        const categories = categoryCollection.list();
        expect(result).toBe(true);
        expect(categories.length).toBe(2);
        expect(categories[0]).toBe("Category 1");
        expect(categories[1]).toBe("Category Test");

        const notFoundResult = categoryCollection.rename("Category 99", "Category Test 2");
        const alreadyExistsResult = categoryCollection.rename("Category 1", "Category Test");

        expect(notFoundResult).toBe(false);
        expect(alreadyExistsResult).toBe(false);
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

    test("should set the budget of a category", () => {
        const categoryCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(CategoryCollectionImpl);
        categoryCollection.add("Category 1");
        categoryCollection.add("Category 2");

        categoryCollection.setBudget("Category 1", 200 * DECIMAL, PeriodType.Week);
        categoryCollection.setBudget("Category 2", null, PeriodType.Year);

        const categories = categoryCollection.all();

        expect(categories.length).toBe(2);
        expect(categories[0].name).toBe("Category 1");
        expect(categories[0].budgetAmount).toBe(200 * DECIMAL);
        expect(categories[0].budgetPeriodType).toBe(PeriodType.Week);
        expect(categories[1].name).toBe("Category 2");
        expect(categories[1].budgetAmount).toBe(null);
        expect(categories[1].budgetPeriodType).toBe(PeriodType.Year);
    });

    test("should return the budget of a category", () => {
        const categoryCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(CategoryCollectionImpl);
        categoryCollection.add("Category 1");

        categoryCollection.setBudget("Category 1", 200 * DECIMAL, PeriodType.Week);

        const budget = categoryCollection.getBudget("Category 1");

        expect(budget.amount).toBe(200 * DECIMAL);
        expect(budget.periodType).toBe(PeriodType.Week);

        expect(() => categoryCollection.getBudget("Non-Existent Category")).toThrowError(
            'Could not find category named "Non-Existent Category"',
        );
    });

    test("should add filters to a category", () => {
        const categoryCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(CategoryCollectionImpl);

        categoryCollection.add("New category");

        const customFilter = new ManualFilter(0x3528, 0x9302323);
        let customFilterInitCalled = false;
        customFilter.init = () => (customFilterInitCalled = true);

        categoryCollection.addFilters("New category", [
            customFilter,
            new ManualFilter(0x6934, 0x2393803),
        ]);

        expect(customFilterInitCalled).toBe(true);
        const filters = categoryCollection.getFilters("New category");
        expect(filters.length).toBe(2);
        expect(filters[0]).toBeInstanceOf(ManualFilter);
        expect(filters[0].id).toBe(0x3528);
        expect((filters[0] as ManualFilter).transactionHash).toBe(0x9302323);
        expect(filters[1].id).toBe(0x6934);
        expect((filters[1] as ManualFilter).transactionHash).toBe(0x2393803);

        // Override filter with new filter
        categoryCollection.addFilters("New category", [new ManualFilter(0x3528, 0x10239234)]);

        const overriddenFilters = categoryCollection.getFilters("New category");
        expect(overriddenFilters.length).toBe(2);
        expect(overriddenFilters[0]).toBeInstanceOf(ManualFilter);
        expect(overriddenFilters[0].id).toBe(0x3528);
        expect((overriddenFilters[0] as ManualFilter).transactionHash).toBe(0x10239234);
        expect(overriddenFilters[1].id).toBe(0x6934);
    });

    test("should remove a filter from a category", () => {
        const categoryCollection = injector
            .provideClass("storage", StorageMock)
            .injectClass(CategoryCollectionImpl);

        categoryCollection.add("New category");

        categoryCollection.addFilters("New category", [
            new ManualFilter(0x3528, 0x9302323),
            new ManualFilter(0x6934, 0x2393803),
        ]);

        categoryCollection.removeFilters("New category", [0x3528]);

        const filters = categoryCollection.getFilters("New category");
        expect(filters.length).toBe(1);
        expect(filters[0]).toBeInstanceOf(ManualFilter);
        expect(filters[0].id).toBe(0x6934);
        expect((filters[0] as ManualFilter).transactionHash).toBe(0x2393803);

        expect(() => categoryCollection.removeFilters("New category", [0x0005])).toThrowError(
            'Could not find filter with id 5 inside category "New category"',
        );
    });

    test("should load categories from persistent storage", () => {
        const storageMock = new StorageMock();
        storageMock.storeSettings(
            new Settings(
                [],
                [
                    new Category("Category 1", 100 * DECIMAL, PeriodType.Month, []),
                    new Category("Category 2", 100 * DECIMAL, PeriodType.Month, []),
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
