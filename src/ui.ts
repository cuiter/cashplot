import { State, UI } from "./types";

export class UIImpl implements UI {
    public static inject = ["state"] as const;

    constructor(private state: State) {}

    public init(): void {
        console.log("Hello, world! " + this.state.getState());
    }
}
