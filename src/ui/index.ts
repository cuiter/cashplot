import { State, UI } from "../types";
import Vue from "vue";
import PageComponent from "./components/Page.vue";

export class UIImpl implements UI {
    public static inject = ["state"] as const;

    constructor(private state: State) {}

    public init(): void {
        console.log("Hello, world! " + this.state.getState());

        let v = new Vue({
            el: "#page",
            components: {
                PageComponent
            }
        });

        console.log("Hello, world! " + this.state.getState());
    }
}
