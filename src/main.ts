import "reflect-metadata";

import { createInjector } from "typed-inject";
import { SourcesImpl } from "./sources";
import { TransactionsImpl } from "./transactions";
import { PersistenceImpl } from "./persistence";
import { StateImpl } from "./state";
import { UIImpl } from "./ui";

// Enable live reload for these files.
require("../public/index.html");
require("../public/css/style.css");

const appInjector = createInjector()
    .provideClass("sources", SourcesImpl)
    .provideClass("transactions", TransactionsImpl)
    .provideClass("persistence", PersistenceImpl)
    .provideClass("state", StateImpl);

const ui = appInjector.injectClass(UIImpl);

document.addEventListener("DOMContentLoaded", () => ui.init());
