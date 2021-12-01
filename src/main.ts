import { createInjector } from 'typed-inject';
import { StateImpl } from './state';
import { UIImpl } from './ui';

const appInjector = createInjector()
  .provideClass('state', StateImpl)

const ui = appInjector.injectClass(UIImpl);


document.addEventListener("DOMContentLoaded", () => ui.init());