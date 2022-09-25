import "reflect-metadata";
import { createInjector } from "typed-inject";

import { SourcesImpl } from "./lib/sources";
import { StorageImpl } from "./lib/storage";
import { SourceDataCollectionImpl } from "./lib/collections/source-data-collection";
import { CategoryCollectionImpl } from "./lib/collections/category-collection";
import { TransactionAssignerImpl } from "./lib/processing/transaction-assigner";
import { TransactionSearcherImpl } from "./lib/processing/transaction-searcher";
import { CashFlowCalculatorImpl } from "./lib/processing/cashflow-calculator";
import { LocalStorageDriver } from "./frontend/localstorage-driver";
import { WebUI } from "./frontend/ui";

const appInjector = createInjector()
    .provideClass("sources", SourcesImpl)
    .provideClass("storageDriver", LocalStorageDriver)
    .provideClass("storage", StorageImpl)
    .provideClass("sourceData", SourceDataCollectionImpl)
    .provideClass("categories", CategoryCollectionImpl)
    .provideClass("assigner", TransactionAssignerImpl)
    .provideClass("searcher", TransactionSearcherImpl)
    .provideClass("cashFlow", CashFlowCalculatorImpl);

const ui = appInjector.injectClass(WebUI);

document.addEventListener("DOMContentLoaded", () => ui.init());
