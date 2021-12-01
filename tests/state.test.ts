import { createInjector } from "typed-inject";
import { StateImpl } from "../src/state";

describe("StateImpl", () => {
    const injector = createInjector().provideClass("state", StateImpl);

    test("calculates the current state", () => {
        const state = injector.injectClass(StateImpl);

        const expected = 3;

        expect(state.getState()).toBe(expected);
    });
});
