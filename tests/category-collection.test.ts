import { createInjector } from "typed-inject";
import { CategoryCollectionImpl } from "../src/controller/collections/category-collection";

describe("CategoryCollectionImpl", () => {
    const injector = createInjector();

    test("should add a category to its collection", () => {
        const categoryCollection = injector.injectClass(CategoryCollectionImpl);

        expect(categoryCollection.list()).toEqual([]);

        expect(categoryCollection.add()).toBe("New category");
        expect(categoryCollection.add()).toBe("New category (1)");

        const categories = categoryCollection.list();
        expect(categories.length).toBe(2);
        expect(categories[0]).toBe("New category");
        expect(categories[1]).toBe("New category (1)");
    });
});
