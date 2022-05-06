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

/**
 * cyrb53 hash function, licensed under the public domain.
 * Source: https://stackoverflow.com/a/52171480
 */
export function hash(str: string): number {
    const seed = 0;
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 =
        Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
        Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
        Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
        Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Given a name, determines a new name that does not conflict with existing names.
 * For example, if new.txt already exists: new.txt -> new.txt (1)
 */
export function findNewName(name: string, existingNames: string[]): string {
    let newName = name;
    let index = 1;

    while (existingNames.indexOf(newName) !== -1) {
        newName = `${name} (${index})`;
        index++;
    }

    return newName;
}

/**
 * Generates a new unique numerical id in the form "1yyyyyyyyyxxxxxx"
 * where y = determined by the current time, and
 *       x = determined by a random value
 */
export function createUniqueId(): number {
    return (
        Math.pow(10, 15) +
        (Date.now() % Math.pow(10, 9)) * 1_000_000 +
        Math.floor(Math.random() * 1_000_000)
    );
}

/**
 * Translates a wildcard pattern (such as "One+*+Three") into a regex pattern ("One\+.*\+Three")
 * Applies the necessary escape sequences to match characters such as +, ?, ^, and $.
 */
export function wildcardToRegExp(wildcardStr: string): string {
    const escapedStr = wildcardStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wildcardEscapedStr = escapedStr.replace(/\\\*/g, ".*");

    return wildcardEscapedStr;
}
