import { State } from "./types";

export class StateImpl implements State {
    public static inject = [] as const;

    constructor() {
    }

    public getState() : number {
        return 4;
    }
}