import { State, UI } from "../types";
import Vue from "vue";
import AppComponent from "./components/app.vue";
import PageComponent from "./components/page.vue";
import NavComponent from "./components/nav.vue";

export class UIImpl implements UI {
    public static inject = ["state"] as const;

    constructor(private state: State) {}

    public init(): void {
        Vue.config.errorHandler = function(err, vm, info) {
            console.log('Error: ', err, '\nInfo:', info);
        }
        Vue.component("app-component", AppComponent);
        Vue.component("page-component", PageComponent);
        Vue.component("nav-component", NavComponent);

        let v = new Vue({
            el: "#app",
        });
    }
}
