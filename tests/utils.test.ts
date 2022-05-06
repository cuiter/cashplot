import { wildcardToRegExp } from "../src/utils";

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
});
