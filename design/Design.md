## Design

CashPlot's main objective is to provide a clear view of the user's finances, so that they can make better decisions.

The key design goal is facilitating speedy iteration and development.
In particular, it is designed with the following principles in mind:

-   Easy to change - It should be easy to add, change or remove functionality by ideally changing one part of the code-base. This means extensive re-use.
-   Robust - Classes, methods, interfaces, functionalities should be designed in a way that , and be tested for correctness by the way of unit tests.

There are a few techniques key to CashPlot's design:

-   Dependency Injection - Separation of component interfaces from their implementation means that components can be constructed without the need to know about the implementation of other components.
-   Behavior-Driven Development - Write specifications and interfaces using the language of the user domain, only describing what it should do, not how it should do it. Automate testing the fulfillment of specifications wherever possible, and build fast feedback loops between the users and developers.
-   Caching - Each component may cache its results internally, provided that the returned object reference stays the same when using a cached result.
