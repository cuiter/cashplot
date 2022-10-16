import "reflect-metadata";
import { CashPlot } from "./lib";
import { WebUI } from "./web/ui";

const cashplotInjector = CashPlot._injector();

const ui = cashplotInjector.injectClass(WebUI);
document.addEventListener("DOMContentLoaded", () => ui.init());
