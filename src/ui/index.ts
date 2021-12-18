import { State, UI } from "../types";
import Vue from "vue";
import AppComponent from "./components/app.vue";
import ViewComponent from "./components/view.vue";
import NavComponent from "./components/nav.vue";
import TabNavComponent from "./components/tab-nav.vue";
import HomeViewComponent from "./components/views/home-view.vue";
import DataViewComponent from "./components/views/data-view.vue";
import SourcesTabComponent from "./components/views/data-tabs/sources-tab.vue";

export class UIImpl implements UI {
    public static inject = ["state"] as const;

    constructor(private state: State) {}

    public init(): void {
        Vue.config.errorHandler = function (err, vm, info) {
            console.log("Error: ", err, "\nInfo:", info);
        };

        Vue.component("app-component", AppComponent);
        Vue.component("view-component", ViewComponent);
        Vue.component("nav-component", NavComponent);
        Vue.component("tab-nav-component", TabNavComponent);
        Vue.component("home-view-component", HomeViewComponent);
        Vue.component("data-view-component", DataViewComponent);
        Vue.component("sources-tab-component", SourcesTabComponent);

        let v = new Vue({
            el: "#app",
        });

        this.onResize();
        window.addEventListener("resize", () => this.onResize());
    }

    private onResize(): void {
        // Set the --vh CSS variable to be relative to the viewport height,
        // _without_ the browser navbar (important for mobile).
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    }
}
