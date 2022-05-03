import {
    CategoryCollection,
    SourceDataCollection,
    TransactionAssigner,
    UI,
} from "../interfaces";
import Vue from "vue";

import InfiniteLoading from "vue-infinite-loading";

// Enable live reload for these files.
require("../../public/index.html");
require("../../public/css/style.css");

declare global {
    interface NodeRequire {
        // Binding for Webpack's require.context method.
        // Not-invented-here to avoid @types/webpack-env dependency.
        context: (
            directory: string,
            useSubdirectories: boolean,
            filter: RegExp,
        ) => { (key: string): { default: any }; keys(): string[] }; // eslint-disable-line
    }
}

export class WebUI implements UI {
    public static inject = ["sourceData", "categories", "assigner"] as const;

    constructor(
        private sourceData: SourceDataCollection,
        private categories: CategoryCollection,
        private assigner: TransactionAssigner,
    ) {}

    public init(): void {
        // Global error handler
        /* eslint-disable */
        const handleError = (err: Error, ...args: any[]) => {
            /* eslint-enable */
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
            handleError(err!); // eslint-disable-line
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
        const req = require.context("./", true, /\.(vue)$/i);
        for (const key of req.keys()) {
            const match = key.match(/.*\/(.*)\.vue/);

            if (match !== null) {
                const name = match[1];
                const component = req(key).default;
                Vue.component(name + "-component", component);
            }
        }

        const _v = new Vue({
            el: "#app",
            data: {
                sourceData: this.sourceData,
                categories: this.categories,
                assigner: this.assigner,
            },
            methods: {
                handleError: handleError,
                isDebugModeEnabled: () =>
                    Object.prototype.hasOwnProperty.call(window, "LiveReload"),
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
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    }
}
