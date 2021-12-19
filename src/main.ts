import { createInjector } from "typed-inject";
import { SourcesImpl } from "./sources";
import { StateImpl } from "./state";
import { UIImpl } from "./ui";

// Enable live reload for these files.
require("../public/index.html");
require("../public/css/style.css");

const appInjector = createInjector()
    .provideClass("sources", SourcesImpl)
    .provideClass("state", StateImpl);

const ui = appInjector.injectClass(UIImpl);

document.addEventListener("DOMContentLoaded", () => ui.init());
