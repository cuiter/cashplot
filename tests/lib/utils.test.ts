import { createUniqueId, range, wildcardToRegExp } from "../../src/lib/utils";

describe("utils", () => {
    test("should translate wildcard patterns into RegExp patterns", () => {
        const wildcardPatterns = [
            "Hello*World",
            "Hi. 1+2 = 3.",
            "Is that true!?",
            "(${result}) [1|2]",
            "^\\|",
            "",
        ];
        const regExpPatterns = [
            "Hello.*World",
            "Hi\\. 1\\+2 = 3\\.",
            "Is that true!\\?",
            "\\(\\$\\{result\\}\\) \\[1\\|2\\]",
            "\\^\\\\\\|",
            "",
        ];

        const generatedPatterns = wildcardPatterns.map((pattern) => wildcardToRegExp(pattern));

        expect(generatedPatterns).toEqual(regExpPatterns);
    });

    test("should generate numeric ranges", () => {
        expect(range(1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(range(-5, 5)).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);
        expect(range(1, 1)).toEqual([1]);

        expect(() => range(5, -5)).toThrowError();
    });

    test("should generate unique IDs", () => {
        let previousId = -1;

        for (let i = 0; i < 500; i++) {
            const id = createUniqueId();

            expect(id).not.toEqual(previousId);
            expect(id).toBeGreaterThanOrEqual(0);
            expect(id).toEqual(Math.floor(id));

            previousId = id;
        }
    });
});
