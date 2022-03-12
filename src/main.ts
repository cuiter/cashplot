import "reflect-metadata";

import { createInjector } from "typed-inject";
import { SourcesImpl } from "./controller/sources";
import { TransactionsImpl } from "./controller/transactions";
import { PersistenceImpl } from "./model/persistence";
import { LocalStorageDriver } from "./model/persistence/localstorage-driver";
import { SourceDataCollectionImpl } from "./controller/collections/source-data-collection";
import { CategoryCollectionImpl } from "./controller/collections/category-collection";
import { WebUI } from "./view/web-ui";

const appInjector = createInjector()
    .provideClass("sources", SourcesImpl)
    .provideClass("transactions", TransactionsImpl)
    .provideClass("persistenceDriver", LocalStorageDriver)
    .provideClass("persistence", PersistenceImpl)
    .provideClass("sourceData", SourceDataCollectionImpl)
    .provideClass("categories", CategoryCollectionImpl);

const ui = appInjector.injectClass(WebUI);

document.addEventListener("DOMContentLoaded", () => ui.init());
