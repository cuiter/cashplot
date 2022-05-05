## Design

CashPlot's main objective is to provide a clear view of the user's finances, so that they can make better decisions.

The key design goal is facilitating speedy high-quality iteration and development.
In particular, it is designed with the following principles in mind:

-   Easy to change - It should be easy to add, change or remove features by changing only one or a few parts of the code-base. This means extensive re-use.
-   Robust - Classes, methods, interfaces, functionalities should be designed in a way that is easy to test and such that it handles incorrect inputs in a consistent way.

There are a few techniques key to CashPlot's design:

**Dependency Injection**

Separation of component interfaces from their implementation means that components can be constructed without the need to know about the implementation of other components.

**Behavior-driven development**

Write specifications and interfaces using the language of the user domain, only describing what it should do, not how it should do it. Automate testing the fulfillment of specifications wherever possible, and build fast feedback loops between the users and developers.

Eventually, the tests should serve as an overview of all functionality within the application.

**Data propagation and caching**

An Observer pattern is used for most components that provide data. Subscribers are notified whenever their data is updated.

For example, when a category is modified, the transaction processing component (which uses this data) gets notified,
and re-processes the transactions when needed.

## UI design

To promote reuse of UI elements and colors, a number of standard terms and colors are defined.
By using these terms consistently, the resulting application can begin to have a solid shape.

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

**User introduction**

There are a few ways the user can be introduced to the application:

-   Introduction tutorials, as seen in most open-source apps.
-   Explanation dialogs, opened when the user opens a screen for the first time.

CashPlot may contain both.

## UI architecture

The UI's main UI consists of three parts: the top-nav, the view (current tab or dialog) and the bottom nav.

At every point, there is a selected tab, and there may be one or more dialogs present on top of each other.

**Navigation**

Navigation methods are provided to all components as a Vue mixin.
Every component has the ability to open a dialog, or change the current tab.

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

Development tools:

-   Unit testing framework: Jest
-   UI testing framework: Cypress
-   Build system: webpack
-   Code formatter: prettier
-   Code linter/checker: eslint
-   Class diagram generator: tplant

## Testing

Testing is divided into two layers: user-level testing and component-level testing.

User-level testing is done via UI-tests. This is done so that it's easier to capture and test user-level requirements, because it also tests the (limited) logic in the UI layer.

Component-level testing is done via unit tests. Dependencies are substituted with mocks, such that only the behavior of the component itself is tested.

Tests are named according to the BDD style: "X Should ...". This ensures that the tests are focused on externally-visible behavior, rather than internal details.

## Components

![](ComponentDiagram.png)

The system is subdivided into components using the MVC pattern.

...transaction processing...

...separation of concerns...

## Footnotes

Less-visible aspects of the design, such as the alternatives that were considered, and the UI wireframes, are not described in this document.
