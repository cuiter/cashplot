/**
 * Throws an error if the boolean passed to it evaluates to false.
 * To be used as follows:
 * 		assert(myDate !== undefined, "Date cannot be undefined.");
 */
export function assert(condition: boolean, errorMessage: string) {
    if (!condition) {
        throw new Error(errorMessage);
    }
}
