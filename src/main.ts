import { createInjector } from "typed-inject";
import { StateImpl } from "./state";
import { UIImpl } from "./ui";

// Enable live reload for these files.
require("../public/index.html");
require("../public/css/style.css");

const appInjector = createInjector().provideClass("state", StateImpl);

const ui = appInjector.injectClass(UIImpl);

document.addEventListener("DOMContentLoaded", () => ui.init());
