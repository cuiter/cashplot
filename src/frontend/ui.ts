import Vue from "vue";
import InfiniteLoading from "vue-infinite-loading";

import { CategoryCollection } from "../lib/collections/category-collection";
import { SourceDataCollection } from "../lib/collections/source-data-collection";
import { CashFlowCalculator } from "../lib/processing/cashflow-calculator";
import { TransactionAssigner } from "../lib/processing/transaction-assigner";
import { TransactionSearcher } from "../lib/processing/transaction-searcher";
import { Storage } from "../lib/storage";
import { Period } from "../lib/utils/period";

export interface UI {
    init(): void;
}

// Enable live reload for the following files.
require("./static/index.html");
require("./static/css/style.css");

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
    public static inject = [
        "sourceData",
        "categories",
        "assigner",
        "searcher",
        "cashFlow",
        "storage",
    ] as const;

    constructor(
        private sourceData: SourceDataCollection,
        private categories: CategoryCollection,
        private assigner: TransactionAssigner,
        private searcher: TransactionSearcher,
        private cashFlow: CashFlowCalculator,
        private storage: Storage,
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
                noResults: "Geen transacties beschikbaar",
                noMore: "-",
                error: "Error while loading data",
            },
        });
        // Load every Vue component from the components directory.
        const req = require.context("./vue/", true, /\.(vue)$/i);
        for (const key of req.keys()) {
            const match = key.match(/.*\/(.*)\.vue/);

            if (match !== null) {
                const name = match[1];
                const component = req(key).default;
                Vue.component(name + "-component", component);
            }
        }

        Vue.mixin(this.createNavigationMixin());

        this.sourceData.init();
        this.categories.init();

        const _v = new Vue({
            el: "#app",
            data: {
                sourceData: this.sourceData,
                categories: this.categories,
                assigner: this.assigner,
                searcher: this.searcher,
                cashFlow: this.cashFlow,
                storage: this.storage,
            },
            methods: {
                handleError: handleError,
                isDebugModeEnabled: () => this.isDebugModeEnabled(),
            },
        });

        this.onResize();
        window.addEventListener("resize", () => this.onResize());

        /* eslint-disable */
        function hideSplashScreen() {
            if ((navigator as any).splashscreen) (navigator as any).splashscreen.hide();
        }

        if ((window as any).deviceReadyCalled === true) {
            /* eslint-enable */
            hideSplashScreen();
        } else {
            document.addEventListener("deviceready", hideSplashScreen, false);
        }
    }

    private isDebugModeEnabled(): boolean {
        return Object.prototype.hasOwnProperty.call(window, "LiveReload");
    }

    /** Creates a Vue mixin attached to a navigation state object. This is used across the Vue components for navigation. */
    private createNavigationMixin() {
        // Data that can be passed to a window
        type WindowEntry = {
            categoryName?: string;
            filterId?: number;
            filterPeriod?: Period;
        };

        const currentTabKey = "debug/currentTab";
        const currentTabDefault = "overview";
        const tabOpenWindowsKey = "debug/tabOpenWindows";
        const tabOpenWindowsDefault: Record<string, [string, WindowEntry | null][]> = {};

        const navState = {
            currentTab: currentTabDefault,
            tabOpenWindows: tabOpenWindowsDefault,
        };

        // Note: The LiveReload script is loaded asychronously, hence the delay.
        //       An alternative may be considered in the future.
        setTimeout(() => {
            if (this.isDebugModeEnabled()) {
                if (window.localStorage.getItem(currentTabKey) !== null) {
                    navState.currentTab =
                        window.localStorage.getItem(currentTabKey) ?? currentTabDefault;
                }
                if (window.localStorage.getItem(tabOpenWindowsKey) !== null) {
                    navState.tabOpenWindows = JSON.parse(
                        window.localStorage.getItem(tabOpenWindowsKey) ?? "{}",
                    );

                    for (const categoryName in navState.tabOpenWindows) {
                        for (const entry of navState.tabOpenWindows[categoryName]) {
                            if (entry[1] !== null && entry[1].filterPeriod) {
                                Object.setPrototypeOf(entry[1].filterPeriod, Period.prototype);
                            }
                        }
                    }
                }
            }
        }, 500);

        const windowInFront = () => {
            const tabOpenedWindows = navState.tabOpenWindows[navState.currentTab] || [];

            if (tabOpenedWindows.length !== 0) {
                return tabOpenedWindows[tabOpenedWindows.length - 1];
            } else {
                return [null, null];
            }
        };

        const storeCurrentTab = () => {
            if (this.isDebugModeEnabled()) {
                window.localStorage.setItem(currentTabKey, navState.currentTab);
            }
        };
        const storeOpenedWindows = () => {
            if (this.isDebugModeEnabled()) {
                window.localStorage.setItem(
                    tabOpenWindowsKey,
                    JSON.stringify(navState.tabOpenWindows),
                );
            }
        };

        return {
            data: () => {
                return { navState: navState };
            },
            computed: {
                currentTab: () => navState.currentTab,
                openedWindow: () => windowInFront()[0],
                openedWindowEntry: () => windowInFront()[1],
            },
            methods: {
                switchTab: (newTabName: string) => {
                    navState.currentTab = newTabName;
                    storeCurrentTab();
                },
                openWindow: (
                    windowName: string, // for example: category-edit
                    entry: WindowEntry | null, // category name, filter id, etc.
                ) => {
                    if (navState.tabOpenWindows[navState.currentTab] === undefined) {
                        Vue.set(navState.tabOpenWindows, navState.currentTab, []);
                    }

                    navState.tabOpenWindows[navState.currentTab].push([windowName, entry]);

                    storeOpenedWindows();
                },
                changeWindowEntry(entry: WindowEntry | null) {
                    const tabOpenWindows = navState.tabOpenWindows[navState.currentTab];
                    if (tabOpenWindows !== undefined && tabOpenWindows.length !== 0) {
                        tabOpenWindows[tabOpenWindows.length - 1][1] = entry;
                        storeOpenedWindows();
                    }
                },
                closeWindow: () => {
                    const windowIndex = navState.tabOpenWindows[navState.currentTab].length - 1;
                    if (windowIndex !== -1) {
                        navState.tabOpenWindows[navState.currentTab].splice(windowIndex, 1);

                        storeOpenedWindows();
                    }
                },
            },
        };
    }

    private onResize(): void {
        // Set the --vh CSS variable to be relative to the viewport height,
        // _without_ the browser navbar (important for mobile).
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    }
}
