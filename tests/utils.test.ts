import { createUniqueId, wildcardToRegExp } from "../src/utils";

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

        const generatedPatterns = wildcardPatterns.map((pattern) =>
            wildcardToRegExp(pattern),
        );

        expect(generatedPatterns).toEqual(regExpPatterns);
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
