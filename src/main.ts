import "reflect-metadata";

import { createInjector } from "typed-inject";
import { SourcesImpl } from "./components/sources";
import { TransactionsImpl } from "./components/transactions";
import { PersistenceImpl } from "./components/persistence";
import { LocalStorageDriver } from "./components/persistence/localstorage-driver";
import { StateImpl } from "./components/state";
import { UIImpl } from "./components/ui";

const appInjector = createInjector()
    .provideClass("sources", SourcesImpl)
    .provideClass("transactions", TransactionsImpl)
    .provideClass("persistenceDriver", LocalStorageDriver)
    .provideClass("persistence", PersistenceImpl)
    .provideClass("state", StateImpl);

const ui = appInjector.injectClass(UIImpl);

document.addEventListener("DOMContentLoaded", () => ui.init());
