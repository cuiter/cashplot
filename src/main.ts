import "reflect-metadata";

import { createInjector } from "typed-inject";
import { SourcesImpl } from "./controller/sources";
import { StorageImpl } from "./model/storage";
import { LocalStorageDriver } from "./model/storage/localstorage-driver";
import { SourceDataCollectionImpl } from "./controller/collections/source-data-collection";
import { CategoryCollectionImpl } from "./controller/collections/category-collection";
import { WebUI } from "./view/web-ui";
import { TransactionAssignerImpl } from "./controller/processing/transaction-assigner";
import { TransactionSearcherImpl } from "./controller/processing/transaction-searcher";
import { CashFlowCalculatorImpl } from "./controller/processing/cashflow-calculator";

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
