## Design

CashPlot's main objective is to provide a clear view of the user's finances, so that they can make better decisions.

The key design goal is facilitating speedy iteration and development.
In particular, it is designed with the following principles in mind:

-   Easy to change - It should be easy to add, change or remove functionality by ideally changing one part of the code-base. This means extensive re-use.
-   Robust - Classes, methods, interfaces, functionalities should be designed in a way that , and be tested for correctness by the way of unit tests.

There are a few techniques key to CashPlot's design:

**Dependency Injection**

Separation of component interfaces from their implementation means that components can be constructed without the need to know about the implementation of other components.

**Behavior-driven development**

Write specifications and interfaces using the language of the user domain, only describing what it should do, not how it should do it. Automate testing the fulfillment of specifications wherever possible, and build fast feedback loops between the users and developers.

**Caching**

Each component may cache its results internally, provided that the returned object reference stays the same when using a cached result.  
All UI components may cache result fetched from other components, provided that the results do not change within the UI component's lifetime.

## UI design

To promote reuse of UI elements and colors, a number of standard terms and colors are defined.
By using these terms consistently, the resulting application can be much easier to change.

Concept definitions:

-   Page: home, app, FAQ (also as a dialog within the app)

-   Root: app, nav, top-nav

-   Tab: overview, source-data, category, budget, balance
-   Dialog (full-screen pop-up view): category-entry, filter-entry
-   Modal (partial-screen pop-up view): error-message, confirmation-request

-   Container: scrollable-list, transaction-list, category-list
-   Element: button, splitter, transaction, category

Color definitions:

-   background
-   element-background
-   light-element-background
-   input-background
-   nav-background
-   nav-background-selected
-   active-border
-   inactive-border

-   primary (text and icons)
-   secondary (darkened text)

-   positive (green)
-   negative (orange)

## Tech stack

The main goal of the tech stack is to make CashPlot accessible on a wide variety of devices.
This section lists the different technologies that are used.

Target platforms:

-   Modern web browsers (Chrome, Firefox, Safari, 2015 and newer)
-   Android 5.0+

Runtime stack:

-   Frontend language: HTML, CSS, JavaScript (for interop)
-   Main language: TypeScript
-   Web framework: Vue
-   Dependency injection framework: typed-inject
-   Testing framework: Jest

Development tools:

-   Build system: webpack
-   Code formatter: prettier
-   Class diagram generator: tplant
