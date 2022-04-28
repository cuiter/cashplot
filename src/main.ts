import "reflect-metadata";

import { createInjector } from "typed-inject";
import { SourcesImpl } from "./controller/sources";
import { TransactionsImpl } from "./controller/transactions";
import { StorageImpl } from "./model/storage";
import { LocalStorageDriver } from "./model/storage/localstorage-driver";
import { SourceDataCollectionImpl } from "./controller/collections/source-data-collection";
import { CategoryCollectionImpl } from "./controller/collections/category-collection";
import { WebUI } from "./view/web-ui";

const appInjector = createInjector()
    .provideClass("sources", SourcesImpl)
    .provideClass("transactions", TransactionsImpl)
    .provideClass("storageDriver", LocalStorageDriver)
    .provideClass("storage", StorageImpl)
    .provideClass("sourceData", SourceDataCollectionImpl)
    .provideClass("categories", CategoryCollectionImpl);

const ui = appInjector.injectClass(WebUI);

document.addEventListener("DOMContentLoaded", () => ui.init());
