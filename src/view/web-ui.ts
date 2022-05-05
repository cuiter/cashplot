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

        Vue.mixin(this.createNavigationMixin());

        const _v = new Vue({
            el: "#app",
            data: {
                sourceData: this.sourceData,
                categories: this.categories,
                assigner: this.assigner,
            },
            methods: {
                handleError: handleError,
                isDebugModeEnabled: () => this.isDebugModeEnabled(),
            },
        });

        this.onResize();
        window.addEventListener("resize", () => this.onResize());

        this.sourceData.init();
        this.categories.init();
    }

    private isDebugModeEnabled(): boolean {
        return Object.prototype.hasOwnProperty.call(window, "LiveReload");
    }

    /** Creates a Vue mixin attached to a navigation state object. This is used across the Vue components for navigation. */
    private createNavigationMixin() {
        const currentTabKey = "debug/currentTab";
        const currentTabDefault = "overview";
        const tabOpenDialogsKey = "debug/tabOpenDialogs";
        const tabOpenDialogsDefault = {};

        const navState = {
            currentTab:
                window.localStorage.getItem(currentTabKey) ?? currentTabDefault,
            tabOpenDialogs: (JSON.parse(
                window.localStorage.getItem(tabOpenDialogsKey) ?? "null",
            ) ?? tabOpenDialogsDefault) as Record<
                string,
                [string, string | number | null][]
            >,
        };

        const dialogInFront = () => {
            const tabOpenedDialogs =
                navState.tabOpenDialogs[navState.currentTab] || [];

            if (tabOpenedDialogs.length !== 0) {
                return tabOpenedDialogs[tabOpenedDialogs.length - 1];
            } else {
                return [null, null];
            }
        };

        const storeCurrentTab = this.isDebugModeEnabled()
            ? () => {
                  if (this.isDebugModeEnabled()) {
                      window.localStorage.setItem(
                          currentTabKey,
                          navState.currentTab,
                      );
                  }
              }
            : () => {
                  // Do nothing
              };
        const storeOpenedDialogs = this.isDebugModeEnabled()
            ? () => {
                  if (this.isDebugModeEnabled()) {
                      window.localStorage.setItem(
                          tabOpenDialogsKey,
                          JSON.stringify(navState.tabOpenDialogs),
                      );
                  }
              }
            : () => {
                  // Do nothing
              };

        return {
            data: () => {
                return { navState: navState };
            },
            computed: {
                currentTab: () => navState.currentTab,
                openedDialog: () => dialogInFront()[0],
                openedDialogEntry: () => dialogInFront()[1],
            },
            methods: {
                switchTab: (newTabName: string) => {
                    navState.currentTab = newTabName;
                    storeCurrentTab();
                    if (this.isDebugModeEnabled()) {
                        window.localStorage.setItem(currentTabKey, newTabName);
                    }
                },
                openDialog: (
                    dialogName: string, // for example: category-edit
                    entry: string | number | null, // category name, filter id, etc.
                ) => {
                    if (
                        navState.tabOpenDialogs[navState.currentTab] ===
                        undefined
                    ) {
                        Vue.set(
                            navState.tabOpenDialogs,
                            navState.currentTab,
                            [],
                        );
                    }

                    navState.tabOpenDialogs[navState.currentTab].push([
                        dialogName,
                        entry,
                    ]);

                    storeOpenedDialogs();
                },
                closeDialog: () => {
                    const dialogIndex =
                        navState.tabOpenDialogs[navState.currentTab].length - 1;
                    if (dialogIndex !== -1) {
                        navState.tabOpenDialogs[navState.currentTab].splice(
                            dialogIndex,
                            1,
                        );

                        storeOpenedDialogs();
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
