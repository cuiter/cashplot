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

        this.onResize();
        window.addEventListener('resize', () => this.onResize());
    }

    private onResize(): void {
        // Set the --vh CSS variable to be relative to the viewport height,
        // _without_ the browser navbar (important for mobile).
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
}
