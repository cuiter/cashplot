import { CategoryCollection, SourceDataCollection, UI } from "../../interfaces";
import Vue from "vue";
import AppComponent from "./components/app.vue";
import ViewComponent from "./components/view.vue";
import NavComponent from "./components/nav.vue";
import TabNavComponent from "./components/tab-nav.vue";
import HomeViewComponent from "./components/views/home-view.vue";
import DataViewComponent from "./components/views/data-view.vue";
import SourcesTabComponent from "./components/views/data-tabs/sources-tab.vue";

import InfiniteLoading from "vue-infinite-loading";

// Enable live reload for these files.
require("../../../public/index.html");
require("../../../public/css/style.css");

declare global {
    interface NodeRequire {
        // Binding for Webpack's require.context method.
        // Not-invented-here to avoid @types/webpack-env dependency.
        context: (
            directory: string,
            useSubdirectories: boolean,
            filter: RegExp,
        ) => { (key: string): { default: any }; keys(): string[] };
    }
}

export class UIImpl implements UI {
    public static inject = ["sourceData", "categories"] as const;

    constructor(
        private sourceData: SourceDataCollection,
        private categories: CategoryCollection,
    ) {}

    public init(): void {
        // Global error handler
        const handleError = (err: Error, ...args: any[]) => {
            // For debugging purposes, show every error as an alert message.
            // Note: an alternative should be considered when moving to production.

            alert(err);
            console.error(err, ...args);
        };

        // Install global error handler
        Vue.config.errorHandler = function (err, vm, info) {
            handleError(err, "\nInfo:", info);
        };
        window.onerror = function (msg, url, lineNo, columnNo, err) {
            handleError(err!);
            return false;
        };

        // Load Vue component dependencies.
        Vue.use(InfiniteLoading, {
            slots: {
                noResults: "No data available",
                noMore: "-",
                error: "Error while loading data",
            },
        });
        // Load every Vue component from the components directory.
        const req = require.context("./components/", true, /\.(vue)$/i);
        for (const key of req.keys()) {
            const name = key.match(/.*\/(.*)\.vue/)![1];
            var component = req(key).default;
            Vue.component(name + "-component", component);
        }

        let v = new Vue({
            el: "#app",
            data: {
                sourceData: this.sourceData,
                categories: this.categories,
            },
            methods: {
                handleError: handleError,
                isDebugModeEnabled: () => window.hasOwnProperty("LiveReload"),
            },
        });

        this.onResize();
        window.addEventListener("resize", () => this.onResize());

        this.sourceData.init();
        this.categories.init();
    }

    private onResize(): void {
        // Set the --vh CSS variable to be relative to the viewport height,
        // _without_ the browser navbar (important for mobile).
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    }
}
